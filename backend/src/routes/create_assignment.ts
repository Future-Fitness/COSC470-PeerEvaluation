import { FastifyInstance } from 'fastify';
import models from '../util/database';

export default function (app: FastifyInstance) {
  const Assignment = models.Assignment;

  app.post('/create_assignment', async (req, resp) => {
    const { courseID, name } = req.body as {
        courseID?: number,
        name?: string
    };

    // Validate required fields
    if (!name) {
      resp.status(400).send({ error: 'Assignment name is required' });
      return;
    }

    if (!courseID) {
      resp.status(400).send({ error: 'Course ID is required' });
      return;
    }

    try {
      const newAssignment = await Assignment.create({
        courseID,
        name
      });

      resp.send({
        message: 'Assignment created',
        id: newAssignment.id,
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      resp.status(500).send({ error: 'Failed to create assignment' });
    }
  });
}