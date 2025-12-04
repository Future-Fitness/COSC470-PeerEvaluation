import { FastifyInstance } from 'fastify';
import models from '../../../util/database';

export default function (app: FastifyInstance) {
  const group = models.CourseGroup;

  app.post('/create_group', async (req, resp) => {
    const { assignmentID, name, id} = req.body as {
        id?: number,
        name?: string,
        assignmentID?: number
    };
    
    // Validate required fields
    if (!name) {
      resp.status(400).send({ error: 'Group name is required' });
      return;
    }

    if (!assignmentID) {
      resp.status(400).send({ error: 'Assignment ID is required' });
      return;
    }
    
    try {
      const newGroup = await group.create({
        id,
        name,
        assignmentID
      });

      resp.send({
        message: 'group created',
        id: newGroup.id,
      });
    } catch (error) {
      console.error('Error creating group:', error);
      resp.status(500).send({ error: 'Failed to create group' });
    }
  });
}