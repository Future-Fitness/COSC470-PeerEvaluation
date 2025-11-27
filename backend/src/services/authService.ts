import { sha512, sha512_256 } from 'js-sha512';
import authRepository from '../repositories/authRepository';

// Counter for additional uniqueness
let tokenCounter = 0;

class AuthService {
  private generateToken(username: string): string {
    // Use multiple entropy sources for guaranteed uniqueness
    const timestamp = Date.now();
    const highResTime = process.hrtime.bigint();
    const randomValue = Math.random().toString(36);
    const counter = tokenCounter++;
    const cpuUsage = process.cpuUsage().system;

    // Combine all sources of entropy
    const seed = `${username}:${timestamp}:${highResTime}:${randomValue}:${counter}:${cpuUsage}`;
    return sha512_256(seed);
  }

  async authenticateUser(username: string, password: string, app: any) {
    const hashedPass = sha512(password);

    // Check if user/pass is correct
    const userData = await authRepository.findUserByCredentials(username, hashedPass);

    if (!userData) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(username);

    // Store a session token in the global state
    app.session[token] = {
      // TODO make this configurable
      // Expire in 20 minutes
      inactivityExpire: Date.now() + 20 * 60 * 1000,
      // No matter what, expire after 3 days
      fullExpire: Date.now() + 3 * 24 * 60 * 60 * 1000,
      username: username,
      id: userData.id,
    };

    return {
      token,
      isTeacher: userData.is_teacher,
    };
  }

  async validateToken(token: string) {
    return await authRepository.validateSessionToken(token);
  }
}

export default new AuthService();