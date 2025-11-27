import { FastifyInstance } from 'fastify';
import authController from '../controllers/authController';

export default function (app: FastifyInstance) {
  app.get('/login', authController.login.bind(authController));
}
