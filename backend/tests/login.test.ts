import { describe, expect, test, jest } from '@jest/globals';
import { app } from '../src/app'

jest.mock('../src/util/database', () => {
  const User = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findOne: jest.fn((config: any) => {
      const name = config.where.name;
      if (name === 'test') {
        return {
          id: 1,
          name: 'test',
          email: 'test@test.com',
          is_teacher: false,
        }
      }

      return null;
    }),
  }

  return {
    User,
    sequelize: {
      query: jest.fn((query: any, options: any) => {
        if (options.replacements.user === 'test') {
          return [User.findOne({ where: { name: 'test' } })];
        }
        return [];
      })
    }
  }
})

describe('/login', () => {
  test('proper login should return 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/login',
      headers: {
        authorization: 'Basic ' + btoa('test:test')
      }
    })
    expect(response.statusCode).toBe(200)
  })

  test('improper login should return 401', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/login',
      headers: {
        authorization: 'Basic ' + btoa('wrong:wrong')
      }
    })
    expect(response.statusCode).toBe(401)
  })
})