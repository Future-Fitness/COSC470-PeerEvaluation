import { FastifyInstance } from 'fastify';
import { getMySubmissionController, getAssignmentSubmissionsController } from '../../../controllers/submissionController';
import models from '../../../util/database';

const Submission = models.Submission;

export default function (app: FastifyInstance) {
  // Get a specific submission by ID
  app.get<{ Params: { id: string } }>('/submission/:id', async (req, resp) => {
    try {
      const { id } = req.params;

      const submission = await Submission.findByPk(id);

      if (!submission) {
        resp.status(404).send({ error: 'Submission not found' });
        return;
      }

      resp.send(submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      resp.status(500).send({ error: 'Failed to fetch submission' });
    }
  });

  // Get all submissions for an assignment (with student details)
  app.get<{ Params: { assignmentID: string } }>('/submissions/:assignmentID', async (req, resp) => {
    await getAssignmentSubmissionsController(req, resp);
  });

  // Get current user's submission for an assignment
  app.get<{ Params: { assignmentID: string } }>('/my_submission/:assignmentID', async (req, resp) => {
    // @ts-expect-error session is added by middleware
    const getSession = (token: string) => app.session[token];
    await getMySubmissionController(req, resp, getSession);
  });
}
