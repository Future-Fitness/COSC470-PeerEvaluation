import axios, { AxiosError } from 'axios';
import { describe, expect, test, beforeAll } from '@jest/globals';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 10000;

const testUsers = {
  student: { username: 'test', password: '1234' },
  teacher: { username: 'test2', password: '1234' },
};

const createBasicAuthHeader = (username: string, password: string): string => {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
};

const createBearerAuthHeader = (token: string): string => {
  return `Bearer ${token}`;
};

const getAuthToken = async (isTeacher = false): Promise<string> => {
  const user = isTeacher ? testUsers.teacher : testUsers.student;
  const response = await axios.get(`${API_BASE_URL}/login`, {
    headers: { Authorization: createBasicAuthHeader(user.username, user.password) },
  });
  return response.data.token;
};

describe('Rubrics and Reviews Integration Tests', () => {
  let teacherToken: string;
  let studentToken: string;
  let testCourseId: number;
  let testAssignmentId: number;
  let testRubricId: number;

  beforeAll(async () => {
    try {
      await axios.get(`${API_BASE_URL}/ping`);
      console.log('✓ Backend server is running');
    } catch (error) {
      throw new Error('Server not available');
    }

    teacherToken = await getAuthToken(true);
    studentToken = await getAuthToken(false);

    const courseResponse = await axios.post(
      `${API_BASE_URL}/create_class`,
      { name: `Test Course ${Date.now()}` },
      { headers: { Authorization: createBearerAuthHeader(teacherToken) } }
    );
    testCourseId = courseResponse.data.id;

    const assignmentResponse = await axios.post(
      `${API_BASE_URL}/create_assignment`,
      { courseID: testCourseId, name: `Test Assignment ${Date.now()}` },
      { headers: { Authorization: createBearerAuthHeader(teacherToken) } }
    );
    testAssignmentId = assignmentResponse.data.id;
  }, TEST_TIMEOUT * 2);

  describe('POST /create_rubric', () => {
    test('should create rubric with valid data', async () => {
      const rubricData = {
        id: Math.floor(Math.random() * 1000000),
        assignmentID: testAssignmentId,
        canComment: true,
      };

      const response = await axios.post(`${API_BASE_URL}/create_rubric`, rubricData, {
        headers: { Authorization: createBearerAuthHeader(teacherToken) },
      });

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Rubric created');
      expect(response.data.id).toBe(rubricData.id);

      testRubricId = rubricData.id;
    }, TEST_TIMEOUT);

    test('should create rubric with canComment false', async () => {
      const rubricData = {
        id: Math.floor(Math.random() * 1000000),
        assignmentID: testAssignmentId,
        canComment: false,
      };

      const response = await axios.post(`${API_BASE_URL}/create_rubric`, rubricData, {
        headers: { Authorization: createBearerAuthHeader(teacherToken) },
      });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(rubricData.id);
    }, TEST_TIMEOUT);

    test('should replace existing rubric with same ID', async () => {
      const rubricId = Math.floor(Math.random() * 1000000);

      await axios.post(
        `${API_BASE_URL}/create_rubric`,
        { id: rubricId, assignmentID: testAssignmentId, canComment: true },
        { headers: { Authorization: createBearerAuthHeader(teacherToken) } }
      );

      const response = await axios.post(
        `${API_BASE_URL}/create_rubric`,
        { id: rubricId, assignmentID: testAssignmentId, canComment: false },
        { headers: { Authorization: createBearerAuthHeader(teacherToken) } }
      );

      expect(response.status).toBe(200);
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.post(`${API_BASE_URL}/create_rubric`, {
          id: 1,
          assignmentID: testAssignmentId,
          canComment: true,
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('GET /rubric', () => {
    beforeAll(async () => {
      testRubricId = Math.floor(Math.random() * 1000000);
      await axios.post(
        `${API_BASE_URL}/create_rubric`,
        { id: testRubricId, assignmentID: testAssignmentId, canComment: true },
        { headers: { Authorization: createBearerAuthHeader(teacherToken) } }
      );
    }, TEST_TIMEOUT);

    test('should get rubric by ID', async () => {
      const response = await axios.get(`${API_BASE_URL}/rubric`, {
        params: { rubricID: testRubricId },
        headers: { Authorization: createBearerAuthHeader(studentToken) },
      });

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(testRubricId);
      expect(response.data.assignmentID).toBe(testAssignmentId);
      expect(response.data).toHaveProperty('canComment');
    }, TEST_TIMEOUT);

    test('should fail without rubricID parameter', async () => {
      try {
        await axios.get(`${API_BASE_URL}/rubric`, {
          headers: { Authorization: createBearerAuthHeader(studentToken) },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    }, TEST_TIMEOUT);

    test('should return 404 for non-existent rubric', async () => {
      try {
        await axios.get(`${API_BASE_URL}/rubric`, {
          params: { rubricID: 999999 },
          headers: { Authorization: createBearerAuthHeader(studentToken) },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/rubric`, {
          params: { rubricID: testRubricId },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('GET /criteria', () => {
    let rubricWithCriteria: number;

    beforeAll(async () => {
      rubricWithCriteria = Math.floor(Math.random() * 1000000);
      await axios.post(
        `${API_BASE_URL}/create_rubric`,
        { id: rubricWithCriteria, assignmentID: testAssignmentId, canComment: true },
        { headers: { Authorization: createBearerAuthHeader(teacherToken) } }
      );
    }, TEST_TIMEOUT);

    test('should return criteria for rubric', async () => {
      const response = await axios.get(`${API_BASE_URL}/criteria`, {
        params: { rubricID: rubricWithCriteria },
        headers: { Authorization: createBearerAuthHeader(studentToken) },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    }, TEST_TIMEOUT);

    test('should return empty array for rubric with no criteria', async () => {
      const response = await axios.get(`${API_BASE_URL}/criteria`, {
        params: { rubricID: rubricWithCriteria },
        headers: { Authorization: createBearerAuthHeader(studentToken) },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    }, TEST_TIMEOUT);

    test('should fail without rubricID parameter', async () => {
      try {
        await axios.get(`${API_BASE_URL}/criteria`, {
          headers: { Authorization: createBearerAuthHeader(studentToken) },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/criteria`, {
          params: { rubricID: rubricWithCriteria },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('POST /create_review', () => {
    let reviewerId: number;
    let revieweeId: number;

    beforeAll(async () => {
      const reviewerResponse = await axios.get(`${API_BASE_URL}/user_id`, {
        headers: { Authorization: createBearerAuthHeader(studentToken) },
      });
      reviewerId = parseInt(reviewerResponse.data);

      const teacherResponse = await axios.get(`${API_BASE_URL}/user_id`, {
        headers: { Authorization: createBearerAuthHeader(teacherToken) },
      });
      revieweeId = parseInt(teacherResponse.data);
    }, TEST_TIMEOUT);

    test('should create review with valid data', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/create_review`,
        {
          assignmentID: testAssignmentId,
          reviewerID: reviewerId,
          revieweeID: revieweeId,
        },
        { headers: { Authorization: createBearerAuthHeader(studentToken) } }
      );

      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Review created');
      expect(response.data).toHaveProperty('id');
    }, TEST_TIMEOUT);

    test('should allow multiple reviews for same assignment', async () => {
      const response1 = await axios.post(
        `${API_BASE_URL}/create_review`,
        {
          assignmentID: testAssignmentId,
          reviewerID: reviewerId,
          revieweeID: revieweeId,
        },
        { headers: { Authorization: createBearerAuthHeader(studentToken) } }
      );

      const response2 = await axios.post(
        `${API_BASE_URL}/create_review`,
        {
          assignmentID: testAssignmentId,
          reviewerID: revieweeId,
          revieweeID: reviewerId,
        },
        { headers: { Authorization: createBearerAuthHeader(teacherToken) } }
      );

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.data.id).not.toBe(response2.data.id);
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.post(`${API_BASE_URL}/create_review`, {
          assignmentID: testAssignmentId,
          reviewerID: reviewerId,
          revieweeID: revieweeId,
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });

  describe('GET /review', () => {
    let reviewerId: number;
    let revieweeId: number;

    beforeAll(async () => {
      const reviewerResponse = await axios.get(`${API_BASE_URL}/user_id`, {
        headers: { Authorization: createBearerAuthHeader(studentToken) },
      });
      reviewerId = parseInt(reviewerResponse.data);

      const teacherResponse = await axios.get(`${API_BASE_URL}/user_id`, {
        headers: { Authorization: createBearerAuthHeader(teacherToken) },
      });
      revieweeId = parseInt(teacherResponse.data);

      await axios.post(
        `${API_BASE_URL}/create_review`,
        { assignmentID: testAssignmentId, reviewerID: reviewerId, revieweeID: revieweeId },
        { headers: { Authorization: createBearerAuthHeader(studentToken) } }
      );
    }, TEST_TIMEOUT);

    test('should get review by parameters', async () => {
      const response = await axios.get(`${API_BASE_URL}/review`, {
        params: {
          assignmentID: testAssignmentId,
          reviewerID: reviewerId,
          revieweeID: revieweeId,
        },
        headers: { Authorization: createBearerAuthHeader(studentToken) },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('grades');
      expect(Array.isArray(response.data.grades)).toBe(true);
    }, TEST_TIMEOUT);

    test('should fail with missing parameters', async () => {
      try {
        await axios.get(`${API_BASE_URL}/review`, {
          params: { assignmentID: testAssignmentId },
          headers: { Authorization: createBearerAuthHeader(studentToken) },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    }, TEST_TIMEOUT);

    test('should return 404 for non-existent review', async () => {
      try {
        await axios.get(`${API_BASE_URL}/review`, {
          params: { assignmentID: 999999, reviewerID: 999999, revieweeID: 999999 },
          headers: { Authorization: createBearerAuthHeader(studentToken) },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    }, TEST_TIMEOUT);

    test('should fail without authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/review`, {
          params: {
            assignmentID: testAssignmentId,
            reviewerID: reviewerId,
            revieweeID: revieweeId,
          },
        });
        throw new Error('Expected request to fail');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    }, TEST_TIMEOUT);
  });
});
