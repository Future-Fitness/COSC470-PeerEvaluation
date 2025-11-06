/**
 * Assignments Integration Tests
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

describe('Assignments Integration Tests', () => {
  let teacherToken: string;
  let studentToken: string;
  let testCourseId: number;

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

    // Create a test course for assignments
    const className = `Test Course for Assignments ${Date.now()}`;
    const response = await axios.post(
      `${API_BASE_URL}/create_class`,
      { name: className },
      {
        headers: {
          Authorization: createBearerAuthHeader(teacherToken),
        },
      }
    );
    testCourseId = response.data.id;
  }, TEST_TIMEOUT);

  describe('POST /create_assignment', () => {
    test('should create a new assignment with valid data', async () => {
      const assignmentName = `Test Assignment ${Date.now()}`;
      const response = await axios.post(
        `${API_BASE_URL}/create_assignment`,
        {
          courseID: testCourseId,
          name: assignmentName,
        },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'Ass-ignment created');
      expect(response.data).toHaveProperty('id');
      expect(typeof response.data.id).toBe('number');
    }, TEST_TIMEOUT);

    test('should allow multiple assignments with same name in different courses', async () => {
      // Create another course
      const className = `Another Course ${Date.now()}`;
      const courseResponse = await axios.post(
        `${API_BASE_URL}/create_class`,
        { name: className },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );
      const anotherCourseId = courseResponse.data.id;

      const assignmentName = `Duplicate Assignment Name ${Date.now()}`;

      // Create assignment in first course
      const response1 = await axios.post(
        `${API_BASE_URL}/create_assignment`,
        {
          courseID: testCourseId,
          name: assignmentName,
        },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );

      // Create assignment with same name in second course
      const response2 = await axios.post(
        `${API_BASE_URL}/create_assignment`,
        {
          courseID: anotherCourseId,
          name: assignmentName,
        },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.data.id).not.toBe(response2.data.id);
    }, TEST_TIMEOUT);

    test('should fail without assignment name', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/create_assignment`,
          { courseID: testCourseId },
          {
            headers: {
              Authorization: createBearerAuthHeader(teacherToken),
            },
          }
        );
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 500]).toContain(axiosError.response?.status);
      }
    }, TEST_TIMEOUT);

    test('should fail without courseID', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/create_assignment`,
          { name: 'Test Assignment' },
          {
            headers: {
              Authorization: createBearerAuthHeader(teacherToken),
            },
          }
        );
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect([400, 500]).toContain(axiosError.response?.status);
      }
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.post(`${API_BASE_URL}/create_assignment`, {
          courseID: testCourseId,
          name: 'Test Assignment',
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('GET /assignments/:course', () => {
    let assignmentId: number;

    beforeAll(async () => {
      // Create a test assignment
      const response = await axios.post(
        `${API_BASE_URL}/create_assignment`,
        {
          courseID: testCourseId,
          name: `Test Assignment for GET ${Date.now()}`,
        },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );
      assignmentId = response.data.id;
    }, TEST_TIMEOUT);

    test('should return assignments for a valid course', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/assignments/${testCourseId}`,
        {
          headers: {
            Authorization: createBearerAuthHeader(studentToken),
          },
        }
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);

      // Verify the assignment we created is in the list
      const foundAssignment = response.data.find((a: any) => a.id === assignmentId);
      expect(foundAssignment).toBeDefined();
    }, TEST_TIMEOUT);

    test('should return empty array for course with no assignments', async () => {
      // Create a course with no assignments
      const className = `Empty Course ${Date.now()}`;
      const courseResponse = await axios.post(
        `${API_BASE_URL}/create_class`,
        { name: className },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );
      const emptyCourseId = courseResponse.data.id;

      const response = await axios.get(
        `${API_BASE_URL}/assignments/${emptyCourseId}`,
        {
          headers: {
            Authorization: createBearerAuthHeader(studentToken),
          },
        }
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(0);
    }, TEST_TIMEOUT);

    test('should return empty array for non-existent course', async () => {
      const response = await axios.get(`${API_BASE_URL}/assignments/999999`, {
        headers: {
          Authorization: createBearerAuthHeader(studentToken),
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(0);
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/assignments/${testCourseId}`);
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should handle both teacher and student access', async () => {
      // Teacher access
      const teacherResponse = await axios.get(
        `${API_BASE_URL}/assignments/${testCourseId}`,
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );

      // Student access
      const studentResponse = await axios.get(
        `${API_BASE_URL}/assignments/${testCourseId}`,
        {
          headers: {
            Authorization: createBearerAuthHeader(studentToken),
          },
        }
      );

      expect(teacherResponse.status).toBe(200);
      expect(studentResponse.status).toBe(200);
      expect(Array.isArray(teacherResponse.data)).toBe(true);
      expect(Array.isArray(studentResponse.data)).toBe(true);
    }, TEST_TIMEOUT);
  });

  describe('Assignment Data Integrity', () => {
    test('should maintain assignment data consistency', async () => {
      const assignmentName = `Consistency Test ${Date.now()}`;

      // Create assignment
      const createResponse = await axios.post(
        `${API_BASE_URL}/create_assignment`,
        {
          courseID: testCourseId,
          name: assignmentName,
        },
        {
          headers: {
            Authorization: createBearerAuthHeader(teacherToken),
          },
        }
      );

      const assignmentId = createResponse.data.id;

      // Retrieve assignments and verify
      const getResponse = await axios.get(
        `${API_BASE_URL}/assignments/${testCourseId}`,
        {
          headers: {
            Authorization: createBearerAuthHeader(studentToken),
          },
        }
      );

      const foundAssignment = getResponse.data.find(
        (a: any) => a.id === assignmentId
      );

      expect(foundAssignment).toBeDefined();
      expect(foundAssignment.name).toBe(assignmentName);
      expect(foundAssignment.courseID).toBe(testCourseId);
    }, TEST_TIMEOUT);
  });
});
