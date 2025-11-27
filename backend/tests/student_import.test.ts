import { describe, test, expect, jest, beforeEach, beforeAll } from '@jest/globals';
import { app, routesRegistered } from '../src/app';

// Mock database models
jest.mock('../src/util/database', () => ({
    Course: {
        findOne: jest.fn()
    },
    User: {
        findOrCreate: jest.fn()
    },
    User_Course: {
        create: jest.fn()
    }
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Course, User, User_Course } = require('../src/util/database');

describe('POST /student_import', () => {
    beforeAll(async () => {
        await routesRegistered;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully import students with only email and name', async () => {
        const csvContent = `email,name
john.doe@test.com,John Doe`;

        Course.findOne.mockResolvedValue({
            id: 1,
            name: 'Test Course'
        });

        User.findOrCreate.mockResolvedValue([{
            id: 10001,
            email: 'john.doe@test.com',
            is_teacher: false
        }, true]);

        const response = await app.inject({
            method: 'POST',
            url: '/student_import',
            payload: {
                courseID: 1,
                students: csvContent
            }
        });

        console.log('Status:', response.statusCode);
        console.log('Body:', response.body);

        expect(response.statusCode).toBe(200);

        // Verify User.findOrCreate was called with email in where clause
        expect(User.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                email: 'john.doe@test.com'
            }
        }));

        // Verify defaults does NOT contain id (auto-generated)
        const callArgs = User.findOrCreate.mock.calls[0][0];
        expect(callArgs.defaults).not.toHaveProperty('id');
        expect(callArgs.defaults).toHaveProperty('email', 'john.doe@test.com');
        expect(callArgs.defaults).toHaveProperty('name', 'John Doe');
    });

    test('should successfully import multiple students', async () => {
        const csvContent = `email,name
jane.smith@test.com,Jane Smith
bob.jones@test.com,Bob Jones`;

        Course.findOne.mockResolvedValue({
            id: 1,
            name: 'Test Course'
        });

        User.findOrCreate
            .mockResolvedValueOnce([{ id: 20001, email: 'jane.smith@test.com', is_teacher: false }, true])
            .mockResolvedValueOnce([{ id: 20002, email: 'bob.jones@test.com', is_teacher: false }, true]);

        const response = await app.inject({
            method: 'POST',
            url: '/student_import',
            payload: {
                courseID: 1,
                students: csvContent
            }
        });

        expect(response.statusCode).toBe(200);

        // Verify User.findOrCreate was called twice
        expect(User.findOrCreate).toHaveBeenCalledTimes(2);

        // Verify both students were processed
        expect(User.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
            where: { email: 'jane.smith@test.com' }
        }));
        expect(User.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
            where: { email: 'bob.jones@test.com' }
        }));
    });
});
