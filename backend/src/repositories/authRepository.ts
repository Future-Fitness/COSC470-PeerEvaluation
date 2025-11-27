import { sequelize } from '../util/database';
import { QueryTypes } from 'sequelize';

interface UserData {
  id: number;
  name: string;
  email: string;
  is_teacher: boolean;
}

class AuthRepository {
  async findUserByCredentials(username: string, hashedPassword: string): Promise<UserData | null> {
    console.log(`Repository: Authenticating user: ${username}`);
    
    const results = await sequelize.query(
      'SELECT * FROM User WHERE BINARY name = :user AND hash_pass = :hashedPass',
      {
        replacements: { user: username, hashedPass: hashedPassword },
        type: QueryTypes.SELECT,
      }
    ) as UserData[];

    if (results.length === 0) {
      console.log('Repository: No user found with provided credentials');
      return null;
    }

    console.log(`Repository: User found: ${results[0].name}`);
    return results[0];
  }

  async storeSessionToken(userId: number, token: string) {
    console.log(`Repository: Storing session token for user ${userId}`);
    
    // For now, we'll store in memory or you could create a Sessions table
    // This is a simplified implementation - in production, use Redis or database
    // For this example, we'll just return the token as it will be validated via middleware
    return token;
  }

  async validateSessionToken(_token: string): Promise<UserData | null> {
    console.log(`Repository: Validating session token`);
    
    // This would typically check against a sessions table or Redis
    // For now, we'll return null as token validation is handled elsewhere
    return null;
  }
}

export default new AuthRepository();