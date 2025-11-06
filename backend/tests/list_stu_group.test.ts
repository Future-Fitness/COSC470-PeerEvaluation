import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { app } from '../src/app';

jest.mock('../src/util/database', () => {
  return {
    Group_Member: {
      findOne: jest.fn(),
      findAll: jest.fn(),
    },
  };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Group_Member } = require('../src/util/database');

describe('/list_stu_group/:studentID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return group members if student is in a group', async () => {
    Group_Member.findAll.mockResolvedValue([
      { id: 1, userID: 42, groupID: 'team1', assignmentID: 99 },
      { id: 2, userID: 43, groupID: 'team1', assignmentID: 99 }
    ]);

    const response = await app.inject({
      method: 'GET',
      url: '/list_stu_group/42'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([
      { id: 1, userID: 42, groupID: 'team1', assignmentID: 99 },
      { id: 2, userID: 43, groupID: 'team1', assignmentID: 99 }
    ]);
    expect(Group_Member.findAll).toHaveBeenCalledWith({
      where: {
        userID: 42
      }
    });
  });

  test('should return 300 if student has no group', async () => {
    Group_Member.findAll.mockResolvedValue([]);

    const response = await app.inject({
      method: 'GET',
      url: '/list_stu_group/42'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
    expect(Group_Member.findAll).toHaveBeenCalledWith({
      where: {
        userID: 42
      }
    });
  });
});
