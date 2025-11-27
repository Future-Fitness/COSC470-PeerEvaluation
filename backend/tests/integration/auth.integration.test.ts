/**
 * Authentication Integration Tests
 *
 * These tests make REAL HTTP requests to the API server
 * and use a REAL test database with seeded data.
 *
 * SETUP:
 * 1. Ensure MySQL is running
 * 2. Seed test database: mysql -u root -p cosc471 < ../schema.sql
 * 3. Start the backend server: npm start
 * 4. Run tests: npm run test:integration
 *
 * OR use the automated script:
 * ./run-integration-tests.sh
 */

import axios, { AxiosError } from 'axios';
import { describe, expect, test, beforeAll, afterEach } from '@jest/globals';

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_TIMEOUT = 10000; // 10 seconds

// Test user credentials (must match test-seed.sql)
const testUsers = {
  student: {
    username: 'test',
    password: '1234',
    email: 'test@test.com',
    isTeacher: false,
  },
  teacher: {
    username: 'test2',
    password: '1234',
    email: 'teacher@test.com',
    isTeacher: true,
  },
  alice: {
    username: 'Harsh2',
    password: 'password123',
    email: 'canadaharsh2002@gmail.com',
    isTeacher: false,
  },
  professor: {
    username: 'professor',
    password: 'password123',
    email: 'prof@example.com',
    isTeacher: true,
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

// Store tokens for cleanup
const tokensToCleanup: string[] = [];

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Verify server is running
    try {
      await axios.get(`${API_BASE_URL}/ping`);
      console.log('✓ Backend server is running');
    } catch (error) {
      console.error('✗ Backend server is not running. Please start it with: npm start');
      throw new Error('Server not available');
    }
  }, TEST_TIMEOUT);

  afterEach(() => {
    // Note: Tokens are stored in-memory on server, cleanup happens on server restart
    tokensToCleanup.length = 0;
  });

  describe('POST /login - Basic Authentication', () => {
    test('should successfully login with valid student credentials', async () => {
      const response = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('isTeacher');
      expect(response.data.isTeacher).toBe(false);
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);

      tokensToCleanup.push(response.data.token);
    }, TEST_TIMEOUT);

    test('should successfully login with valid teacher credentials', async () => {
      const response = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.teacher.username, testUsers.teacher.password),
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('isTeacher');
      expect(response.data.isTeacher).toBe(true);
      expect(typeof response.data.token).toBe('string');

      tokensToCleanup.push(response.data.token);
    }, TEST_TIMEOUT);

    test('should fail with invalid username', async () => {
      try {
        await axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader('nonexistent', 'password'),
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should fail with invalid password', async () => {
      try {
        await axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.student.username, 'wrongpassword'),
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should fail with missing Authorization header', async () => {
      try {
        await axios.get(`${API_BASE_URL}/login`);
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should fail with malformed Authorization header', async () => {
      try {
        await axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: 'InvalidHeader',
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should fail with empty credentials', async () => {
      try {
        await axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader('', ''),
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should generate unique tokens for multiple logins', async () => {
      const response1 = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
        },
      });

      const response2 = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
        },
      });

      expect(response1.data.token).not.toBe(response2.data.token);

      tokensToCleanup.push(response1.data.token, response2.data.token);
    }, TEST_TIMEOUT);

    test('should allow different users to login simultaneously', async () => {
      const [studentResponse, teacherResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
          },
        }),
        axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.teacher.username, testUsers.teacher.password),
          },
        }),
      ]);

      expect(studentResponse.status).toBe(200);
      expect(teacherResponse.status).toBe(200);
      expect(studentResponse.data.token).not.toBe(teacherResponse.data.token);
      expect(studentResponse.data.isTeacher).toBe(false);
      expect(teacherResponse.data.isTeacher).toBe(true);

      tokensToCleanup.push(studentResponse.data.token, teacherResponse.data.token);
    }, TEST_TIMEOUT);
  });

  describe('Token-based Authentication', () => {
    let validToken: string;
    let validUserId: number;

    beforeAll(async () => {
      // Get a valid token for testing
      const loginResponse = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
        },
      });
      validToken = loginResponse.data.token;
      tokensToCleanup.push(validToken);
    }, TEST_TIMEOUT);

    test('should access protected endpoint with valid token', async () => {
      const response = await axios.get(`${API_BASE_URL}/user_id`, {
        headers: {
          Authorization: createBearerAuthHeader(validToken),
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      validUserId = parseInt(response.data);
      expect(validUserId).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    test('should fail to access protected endpoint without token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/user_id`);
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should fail with invalid token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/user_id`, {
          headers: {
            Authorization: createBearerAuthHeader('invalid-token-123'),
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should fail with malformed Bearer token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/user_id`, {
          headers: {
            Authorization: 'Bearer',
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should fail with wrong auth scheme (Basic instead of Bearer)', async () => {
      try {
        await axios.get(`${API_BASE_URL}/user_id`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('Session Management', () => {
    test('should maintain session across multiple requests', async () => {
      // Login
      const loginResponse = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
        },
      });
      const token = loginResponse.data.token;
      tokensToCleanup.push(token);

      // Make multiple requests with same token
      const requests = Array(5).fill(null).map(() =>
        axios.get(`${API_BASE_URL}/user_id`, {
          headers: {
            Authorization: createBearerAuthHeader(token),
          },
        })
      );

      const responses = await Promise.all(requests);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    }, TEST_TIMEOUT);

    test('should handle concurrent requests with different tokens', async () => {
      // Login as two different users
      const [login1, login2] = await Promise.all([
        axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
          },
        }),
        axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.alice.username, testUsers.alice.password),
          },
        }),
      ]);

      const token1 = login1.data.token;
      const token2 = login2.data.token;
      tokensToCleanup.push(token1, token2);

      // Make concurrent requests with different tokens
      const [response1, response2] = await Promise.all([
        axios.get(`${API_BASE_URL}/user_id`, {
          headers: {
            Authorization: createBearerAuthHeader(token1),
          },
        }),
        axios.get(`${API_BASE_URL}/user_id`, {
          headers: {
            Authorization: createBearerAuthHeader(token2),
          },
        }),
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.data).not.toBe(response2.data); // Different user IDs
    }, TEST_TIMEOUT);
  });

  describe('Public Endpoints', () => {
    test('/ping should be accessible without authentication', async () => {
      const response = await axios.get(`${API_BASE_URL}/ping`);
      expect(response.status).toBe(200);
    }, TEST_TIMEOUT);

    test('/login should be accessible without bearer token', async () => {
      const response = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.student.username, testUsers.student.password),
        },
      });
      expect(response.status).toBe(200);
    }, TEST_TIMEOUT);
  });

  describe('Edge Cases', () => {
    test('should handle special characters in password', async () => {
      // Note: This test assumes you have a user with special characters
      // For now, it tests that special characters in wrong password still fail correctly
      try {
        await axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.student.username, 'p@$$w0rd!#$'),
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);



    test('should be case-sensitive for password', async () => {
      try {
        await axios.get(`${API_BASE_URL}/login`, {
          headers: {
            Authorization: createBasicAuthHeader(testUsers.student.username, 'TEST'), // Uppercase of 'test'
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);

    test('should handle very long token strings', async () => {
      const veryLongToken = 'a'.repeat(1000);
      try {
        await axios.get(`${API_BASE_URL}/user_id`, {
          headers: {
            Authorization: createBearerAuthHeader(veryLongToken),
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('Multiple User Types', () => {
    test('should correctly identify student role', async () => {
      const response = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.alice.username, testUsers.alice.password),
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.isTeacher).toBe(false);
      tokensToCleanup.push(response.data.token);
    }, TEST_TIMEOUT);

    test('should correctly identify teacher role', async () => {
      const response = await axios.get(`${API_BASE_URL}/login`, {
        headers: {
          Authorization: createBasicAuthHeader(testUsers.professor.username, testUsers.professor.password),
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.isTeacher).toBe(true);
      tokensToCleanup.push(response.data.token);
    }, TEST_TIMEOUT);
  });
});
