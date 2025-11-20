import { FastifyInstance } from 'fastify';
import models from '../util/database';

const Submission = models.Submission;
const User = models.User;

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

  // Get all submissions for an assignment
  app.get<{ Params: { assignmentID: string } }>('/submissions/:assignmentID', async (req, resp) => {
    try {
      const { assignmentID } = req.params;

      const submissions = await Submission.findAll({
        where: {
          assignmentID,
        },
      });

      // Optionally fetch student info for each submission
      const submissionsWithStudents = await Promise.all(
        submissions.map(async (submission) => {
          const student = await User.findByPk(submission.studentID, {
            attributes: ['id', 'name', 'email'],
          });
          return {
            ...submission.toJSON(),
            student,
          };
        })
      );

      resp.send(submissionsWithStudents);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      resp.status(500).send({ error: 'Failed to fetch submissions' });
    }
  });

  // Get current user's submission for an assignment
  app.get<{ Params: { assignmentID: string } }>('/my_submission/:assignmentID', async (req, resp) => {
    try {
      const { assignmentID } = req.params;

      // Get authenticated user from session
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        resp.status(401).send({ error: 'Unauthorized' });
        return;
      }

      // @ts-expect-error session is added by middleware
      const session = app.session[token];
      if (!session) {
        resp.status(401).send({ error: 'Invalid session' });
        return;
      }

      const studentID = session.id;

      const submission = await Submission.findOne({
        where: {
          studentID,
          assignmentID,
        },
      });

      if (!submission) {
        resp.status(404).send({ error: 'No submission found' });
        return;
      }

      resp.send(submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      resp.status(500).send({ error: 'Failed to fetch submission' });
    }
  });
}
