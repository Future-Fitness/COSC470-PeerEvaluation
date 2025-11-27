import { FastifyInstance } from 'fastify';
import models from '../util/database';

export default function (app: FastifyInstance) {
  app.post('/save_groups', async (req, resp) => {
    const { groupID, userID, assignmentID } = req.body as {
        groupID: number,
        userID: number,
        assignmentID: number
      };
    
    const GroupMembers = models.Group_Member; 
    
    try {
      console.log(`Saving group assignment: userID=${userID}, groupID=${groupID}, assignmentID=${assignmentID}`);
      
      // Use upsert to either update existing record or create new one
      const [record, created] = await GroupMembers.upsert({
        groupID,
        userID,
        assignmentID
      });
      
      console.log(`Group assignment ${created ? 'created' : 'updated'} successfully`);
      
      resp.send({
        message: 'Group saved successfully!',
        groupID,
        userID,
        assignmentID,
        created
      });
    } catch (error) {
      console.error('Error saving group:', error);
      resp.status(500).send({ error: 'Failed to save group assignment' });
    }
  });
}