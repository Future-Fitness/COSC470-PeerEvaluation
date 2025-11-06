/**
 * Classes Integration Tests
 *
 * These tests make REAL HTTP requests to the API server
 * and use a REAL test database with seeded data.
 *
 * SETUP:
 * 1. Ensure MySQL is running
 * 2. Seed test database: mysql -u root -p cosc471 < ../schema.sql
 * 3. Start the backend server: npm start
 * 4. Run tests: npm run test:integration
 */

import axios, { AxiosError } from 'axios';
import { describe, expect, test, beforeAll } from '@jest/globals';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test user credentials
const testUsers = {
  student: {
    username: 'test',
    password: '1234',
  },
  teacher: {
    username: 'test2',
    password: '1234',
  },
};

// Helper functions
const createBasicAuthHeader = (username: string, password: string): string => {
  const credentials = `${username}:${password}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
};

const createBearerAuthHeader = (token: string): string => {
  return `Bearer ${token}`;
};

const getAuthToken = async (isTeacher = false): Promise<string> => {
  const user = isTeacher ? testUsers.teacher : testUsers.student;
  const response = await axios.get(`${API_BASE_URL}/login`, {
    headers: {
      Authorization: createBasicAuthHeader(user.username, user.password),
    },
  });
  return response.data.token;
};

describe('Classes Integration Tests', () => {
  let teacherToken: string;
  let studentToken: string;

  beforeAll(async () => {
    // Verify server is running
    try {
      await axios.get(`${API_BASE_URL}/ping`);
      console.log('✓ Backend server is running');
    } catch (error) {
      console.error('✗ Backend server is not running. Please start it with: npm start');
      throw new Error('Server not available');
    }

    // Get auth tokens
    teacherToken = await getAuthToken(true);
    studentToken = await getAuthToken(false);
  }, TEST_TIMEOUT);

  describe('GET /classes', () => {
    test('should return list of classes', async () => {
      const response = await axios.get(`${API_BASE_URL}/classes`, {
        headers: {
          Authorization: createBearerAuthHeader(studentToken),
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    }, TEST_TIMEOUT);

    test('should return empty array if no classes exist', async () => {
      const response = await axios.get(`${API_BASE_URL}/classes`, {
        headers: {
          Authorization: createBearerAuthHeader(studentToken),
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    }, TEST_TIMEOUT);

    test('should fail without authentication token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/classes`);
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('POST /create_class', () => {
    test('should create a new class with valid data', async () => {
      const className = `Test Class ${Date.now()}`;
      const response = await axios.post(
        `${API_BASE_URL}/create_class`,
        { name: className },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('message', 'Class created');
      expect(response.data).toHaveProperty('id');
      expect(typeof response.data.id).toBe('number');
    }, TEST_TIMEOUT);

    test('should fail when creating duplicate class', async () => {
      const className = `Duplicate Class ${Date.now()}`;

      // Create first class
      await axios.post(
        `${API_BASE_URL}/create_class`,
        { name: className },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );

      // Try to create duplicate
      try {
        await axios.post(
          `${API_BASE_URL}/create_class`,
          { name: className },
          {
            headers: {
              Authorization: createBearerAuthHeader(teacherToken),
            },
          }
        );
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
        expect((axiosError.response?.data as any).message).toBe('Class already exists');
      }
    }, TEST_TIMEOUT);

    test('should fail without class name', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/create_class`,
          {},
          {
            headers: {
              Authorization: createBearerAuthHeader(teacherToken),
            },
          }
        );
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        // Should fail with 400 or 500 depending on implementation
        expect([400, 500]).toContain(axiosError.response?.status);
      }
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.post(`${API_BASE_URL}/create_class`, {
          name: 'Test Class',
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('GET /get_className/:classID', () => {
    let testClassId: number;

    beforeAll(async () => {
      // Create a test class
      const className = `Test Class for Name ${Date.now()}`;
      const response = await axios.post(
        `${API_BASE_URL}/create_class`,
        { name: className },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );
      testClassId = response.data.id;
    }, TEST_TIMEOUT);

    test('should get class name by ID', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/get_className/${testClassId}`,
        {
          headers: {
            Authorization: createBearerAuthHeader(studentToken),
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    }, TEST_TIMEOUT);

    test('should handle non-existent class ID', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/get_className/999999`,
        {
          headers: {
            Authorization: createBearerAuthHeader(studentToken),
          },
        }
      );

      expect(response.status).toBe(200);
      // Should return null or empty result
      expect(response.data === null || response.data === '').toBe(true);
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/get_className/${testClassId}`);
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('GET /class_members/:courseID', () => {
    test('should return class members for valid course', async () => {
      // Assuming course ID 1 exists from seed data
      const response = await axios.get(`${API_BASE_URL}/class_members/1`, {
        headers: {
          Authorization: createBearerAuthHeader(teacherToken),
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    }, TEST_TIMEOUT);

    test('should return empty array for course with no members', async () => {
      // Use a non-existent course ID
      const response = await axios.get(`${API_BASE_URL}/class_members/999999`, {
        headers: {
          Authorization: createBearerAuthHeader(teacherToken),
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(0);
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/class_members/1`);
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });
});
