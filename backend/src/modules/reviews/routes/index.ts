import { FastifyInstance } from 'fastify';
import createReview from './create_review';
import getReview from './get_review';

export default function registerReviewRoutes(app: FastifyInstance) {
  createReview(app);
  getReview(app);
}
