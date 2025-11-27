import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { app } from '../src/app';

// Mock database models
jest.mock('../src/util/database', () => ({
  Course: {
    findByPk: jest.fn()
  },
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  },
  User_Course: {
    findOrCreate: jest.fn()
  }
}));

// Mock email service
jest.mock('../src/services/emailService', () => ({
  default: {
    sendBulkNewStudentEmails: jest.fn<() => Promise<{ sent: string[]; failed: string[] }>>()
      .mockResolvedValue({
        sent: [],
        failed: []
      })
  }
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Course, User, User_Course } = require('../src/util/database');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const emailService = require('../src/services/emailService').default;

describe('POST /upload_students_csv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully upload valid CSV and create new users', async () => {
    const csvContent = `email,name,id,password
john.doe@test.com,John Doe,10001,password123
jane.smith@test.com,Jane Smith,10002,password456`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    User.findOne
      .mockResolvedValueOnce(null) // First student doesn't exist
      .mockResolvedValueOnce(null); // Second student doesn't exist

    User.create
      .mockResolvedValueOnce({ id: 10001, email: 'john.doe@test.com', is_teacher: false })
      .mockResolvedValueOnce({ id: 10002, email: 'jane.smith@test.com', is_teacher: false });

    User_Course.findOrCreate
      .mockResolvedValueOnce([{}, true]) // Created
      .mockResolvedValueOnce([{}, true]); // Created

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body);
    expect(result).toHaveProperty('addedCount');
    expect(result).toHaveProperty('alreadyEnrolledCount');
    expect(result).toHaveProperty('errorCount');
    expect(result).toHaveProperty('newUsersCount');
  });

  test('should handle existing users correctly', async () => {
    const csvContent = `email,name
existing@test.com,Existing User`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    User.findOne.mockResolvedValue({
      id: 100,
      email: 'existing@test.com',
      is_teacher: false
    });

    User_Course.findOrCreate.mockResolvedValue([{}, false]); // Not created, already exists

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body);
    expect(result.alreadyEnrolledCount).toBeGreaterThan(0);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('should reject teacher accounts as students', async () => {
    const csvContent = `email,name
teacher@test.com,Teacher User`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    User.findOne.mockResolvedValue({
      id: 200,
      email: 'teacher@test.com',
      is_teacher: true // This is a teacher
    });

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body);
    expect(result.errorCount).toBeGreaterThan(0);
    expect(result.results.errors).toContainEqual(
      expect.objectContaining({
        email: 'teacher@test.com',
        error: expect.stringContaining('teacher')
      })
    );
  });

  test('should return 400 for missing courseId', async () => {
    const csvContent = `email,name
test@test.com,Test User`;

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(400);
    const result = JSON.parse(response.body);
    expect(result.error).toContain('Course ID');
  });

  test('should return 400 for missing CSV file', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1
      }
    });

    expect(response.statusCode).toBe(400);
    const result = JSON.parse(response.body);
    expect(result.error).toContain('CSV file');
  });

  test('should return 404 for non-existent course', async () => {
    const csvContent = `email,name
test@test.com,Test User`;

    Course.findByPk.mockResolvedValue(null);

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 999,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(404);
    const result = JSON.parse(response.body);
    expect(result.error).toContain('Course not found');
  });

  test('should validate CSV has email column', async () => {
    const csvContent = `name,id
John Doe,10001`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(400);
    const result = JSON.parse(response.body);
    expect(result.error).toContain('missing email');
  });

  test('should return 400 for empty CSV', async () => {
    const csvContent = `email,name`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(400);
    const result = JSON.parse(response.body);
    expect(result.error).toContain('empty or invalid');
  });

  test('should use default password when not provided', async () => {
    const csvContent = `email,name
nopw@test.com,No Password User`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      id: 10003,
      email: 'nopw@test.com',
      is_teacher: false
    });
    User_Course.findOrCreate.mockResolvedValue([{}, true]);

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(200);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'nopw@test.com',
        hash_pass: expect.any(String) // Should be hashed default password
      })
    );
  });

  test('should send emails to new users', async () => {
    const csvContent = `email,name,password
newuser1@test.com,New User 1,pass123
newuser2@test.com,New User 2,pass456`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    User.findOne.mockResolvedValue(null);
    User.create
      .mockResolvedValueOnce({ id: 20001, email: 'newuser1@test.com', is_teacher: false })
      .mockResolvedValueOnce({ id: 20002, email: 'newuser2@test.com', is_teacher: false });
    User_Course.findOrCreate
      .mockResolvedValueOnce([{}, true])
      .mockResolvedValueOnce([{}, true]);

    emailService.sendBulkNewStudentEmails.mockResolvedValue({
      sent: ['newuser1@test.com', 'newuser2@test.com'],
      failed: []
    });

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(200);
    expect(emailService.sendBulkNewStudentEmails).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          email: 'newuser1@test.com',
          courseName: 'Test Course',
          temporaryPassword: 'pass123'
        }),
        expect.objectContaining({
          email: 'newuser2@test.com',
          courseName: 'Test Course',
          temporaryPassword: 'pass456'
        })
      ])
    );
  });

  test('should handle mixed scenarios (new, existing, errors)', async () => {
    const csvContent = `email,name
new@test.com,New User
existing@test.com,Existing User
teacher@test.com,Teacher Account`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    User.findOne
      .mockResolvedValueOnce(null) // new user
      .mockResolvedValueOnce({ id: 100, email: 'existing@test.com', is_teacher: false }) // existing
      .mockResolvedValueOnce({ id: 200, email: 'teacher@test.com', is_teacher: true }); // teacher

    User.create.mockResolvedValue({ id: 30001, email: 'new@test.com', is_teacher: false });
    User_Course.findOrCreate
      .mockResolvedValueOnce([{}, true]) // new - created
      .mockResolvedValueOnce([{}, false]); // existing - already enrolled

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.body);
    expect(result.addedCount).toBeGreaterThan(0);
    expect(result.alreadyEnrolledCount).toBeGreaterThan(0);
    expect(result.errorCount).toBeGreaterThan(0);
  });

  test('should trim whitespace from email addresses', async () => {
    const csvContent = `email,name
  whitespace@test.com  ,User With Spaces`;

    Course.findByPk.mockResolvedValue({
      id: 1,
      name: 'Test Course',
      teacherID: 1
    });

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 40001, email: 'whitespace@test.com', is_teacher: false });
    User_Course.findOrCreate.mockResolvedValue([{}, true]);

    const response = await app.inject({
      method: 'POST',
      url: '/upload_students_csv',
      payload: {
        courseId: 1,
        file: csvContent
      }
    });

    expect(response.statusCode).toBe(200);
    expect(User.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'whitespace@test.com' } // Trimmed
      })
    );
  });
});
