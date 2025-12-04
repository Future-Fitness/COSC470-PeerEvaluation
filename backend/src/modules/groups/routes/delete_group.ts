import { FastifyInstance } from 'fastify';
import models from '../../../util/database';

export default function (app: FastifyInstance) {
  const group = models.CourseGroup;
  const members = models.Group_Member;

  app.post('/delete_group', async (req, resp) => {
    const { groupID } = req.body as {
      groupID: number;
    };

    if (!groupID || typeof groupID !== 'number') {
      return resp.status(400).send({ error: 'Invalid groupID provided' });
    }

    try {
      // Update all members of the group to have groupID -1
      const groupMembers = await members.update(
        { groupID: -1 },
        { where: { groupID } }
      );

      // Delete the group from the CourseGroup table
      const deletedGroup = await group.destroy({ where: { id: groupID } });

      if (deletedGroup === 0) {
        return resp.status(404).send({ error: 'Group not found' });
      }

      resp.send({
        message: 'Group deleted, all members updated',
        id: groupID,
        groupMembers,
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      resp.status(500).send({ error: 'Failed to delete group' });
    }
  });
}