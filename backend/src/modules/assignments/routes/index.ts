import { FastifyInstance } from 'fastify';
import assignments from './assignments';
import createAssignment from './create_assignment';
import getSubmission from './get_submission';
import uploadSubmission from './upload_submission';

export default function registerAssignmentRoutes(app: FastifyInstance) {
  assignments(app);
  createAssignment(app);
  getSubmission(app);
  uploadSubmission(app);
}
