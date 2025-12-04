import { FastifyInstance } from 'fastify';
import login from './login';
import requestOtp from './request_otp';
import verifyOtp from './verify_otp';
import profile from './profile';
import userId from './user_id';

export default function registerAuthRoutes(app: FastifyInstance) {
  login(app);
  requestOtp(app);
  verifyOtp(app);
  profile(app);
  userId(app);
}
