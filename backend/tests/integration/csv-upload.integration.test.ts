import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

const BASE_URL = 'http://localhost:5008';

// Helper to wait for server
async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${BASE_URL}/ping`);
      return true;
    } catch {
      await setTimeout(1000);
    }
  }
  throw new Error('Server did not start in time');
}

describe('CSV Upload Integration Tests', () => {
  let authToken: string;
  let courseId: number;

  beforeAll(async () => {
    await waitForServer();

    // Login as teacher to get auth token
    const loginResponse = await axios.get(`${BASE_URL}/login`, {
      auth: {
        username: 'test_teacher',
        password: 'password123'
      }
    });
    authToken = loginResponse.data.token;

    // Create a test course
    const courseResponse = await axios.post(
      `${BASE_URL}/create_class`,
      { name: 'CSV Upload Test Course' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    courseId = courseResponse.data.id;
  });

  test('should upload CSV with new students successfully', async () => {
    const csvContent = `email,name,id,password
csvtest1@test.com,CSV Test User 1,90001,testpass1
csvtest2@test.com,CSV Test User 2,90002,testpass2
csvtest3@test.com,CSV Test User 3,90003,testpass3`;

    const formData = new FormData();
    formData.append('courseId', courseId.toString());
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'students.csv');

    const response = await axios.post(
      `${BASE_URL}/upload_students_csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('addedCount');
    expect(response.data).toHaveProperty('newUsersCount');
    expect(response.data.addedCount).toBe(3);
    expect(response.data.errorCount).toBe(0);
  });

  test('should handle duplicate uploads correctly', async () => {
    const csvContent = `email,name
csvtest1@test.com,CSV Test User 1 Duplicate`;

    const formData = new FormData();
    formData.append('courseId', courseId.toString());
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'students.csv');

    const response = await axios.post(
      `${BASE_URL}/upload_students_csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.alreadyEnrolledCount).toBeGreaterThan(0);
  });

  test('should verify uploaded students are enrolled', async () => {
    const membersResponse = await axios.post(
      `${BASE_URL}/classes/members`,
      { id: courseId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    expect(membersResponse.status).toBe(200);
    const members = membersResponse.data;
    
    const csvEmails = ['csvtest1@test.com', 'csvtest2@test.com', 'csvtest3@test.com'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memberEmails = members.map((m: any) => m.email);
    
    csvEmails.forEach(email => {
      expect(memberEmails).toContain(email);
    });
  });

  test('should reject CSV without required email column', async () => {
    const csvContent = `name,id
No Email User,99999`;

    const formData = new FormData();
    formData.append('courseId', courseId.toString());
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'invalid.csv');

    try {
      await axios.post(
        `${BASE_URL}/upload_students_csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      throw new Error('Should have thrown an error');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === 'Should have thrown an error') throw error;
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toContain('missing email');
    }
  });

  test('should reject upload without authentication', async () => {
    const csvContent = `email,name
unauthorized@test.com,Unauthorized User`;

    const formData = new FormData();
    formData.append('courseId', courseId.toString());
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'students.csv');

    try {
      await axios.post(
        `${BASE_URL}/upload_students_csv`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      throw new Error('Should have thrown an error');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === 'Should have thrown an error') throw error;
      expect(error.response.status).toBe(401);
    }
  });

  test('should handle large CSV files', async () => {
    const rows = ['email,name,id'];
    for (let i = 1; i <= 50; i++) {
      rows.push(`bulktest${i}@test.com,Bulk Test User ${i},${95000 + i}`);
    }
    const csvContent = rows.join('\n');

    const formData = new FormData();
    formData.append('courseId', courseId.toString());
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'bulk.csv');

    const response = await axios.post(
      `${BASE_URL}/upload_students_csv`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    expect(response.status).toBe(200);
    expect(response.data.addedCount).toBeGreaterThan(0);
  }, 30000); // Increase timeout for bulk operation

  afterAll(async () => {
    // Cleanup: Remove test students
    // Note: You might want to implement a cleanup endpoint for tests
  });
});
