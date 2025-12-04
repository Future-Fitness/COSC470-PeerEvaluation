import { FastifyRequest, FastifyReply } from 'fastify';
import authService from '../modules/auth/services/authService';

class AuthController {
  async login(req: FastifyRequest, reply: FastifyReply) {
    try {
      // This should contain basic auth header
      const auth = req.headers.authorization;
      if (!auth) {
        return reply.status(401).send('Unauthorized');
      }

      // Validate authorization header format
      const parts = auth.split(' ');
      if (parts.length !== 2) {
        return reply.status(401).send('Unauthorized - invalid authorization format');
      }

      const [authType, credentials] = parts;

      // Only accept Basic authentication (case-insensitive)
      if (authType.toLowerCase() !== 'basic') {
        return reply.status(401).send('Unauthorized - must use Basic authentication');
      }

      // Decode credentials with error handling
      let user: string;
      let pass: string;
      try {
        const decoded = Buffer.from(credentials, 'base64').toString('utf-8');
        const colonIndex = decoded.indexOf(':');

        if (colonIndex === -1) {
          return reply.status(401).send('Unauthorized - invalid credentials format');
        }

        // Split only on the first colon (password may contain colons)
        user = decoded.substring(0, colonIndex);
        pass = decoded.substring(colonIndex + 1);
      } catch {
        return reply.status(401).send('Unauthorized - invalid base64 encoding');
      }

      // Authenticate user
      const result = await authService.authenticateUser(user, pass, req.server);
      return reply.send(result);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return reply.status(401).send('Invalid credentials');
      }
      return reply.status(500).send('Internal server error');
    }
  }
}

export default new AuthController();