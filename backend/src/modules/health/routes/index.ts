import { FastifyInstance } from 'fastify';
import ping from './ping';

export default function registerHealthRoutes(app: FastifyInstance) {
  ping(app);
}
