import { FastifyInstance } from 'fastify';
import models from '../util/database';
import { listUnassignedStudents } from '../services/groupService';


export default async function (app: FastifyInstance) {
    const GroupMembers = models.Group_Member;
    const User = models.User;
    
    app.get<{ Params: { assignmentID: number } }>('/list_ua_groups/:assignmentID', async (req, resp) => {
        try {
            const aID = req.params.assignmentID;
            console.log(`Fetching unassigned groups for assignment ${aID}`);
            
            const unassignedStudents = await listUnassignedStudents(aID);
            console.log(`Found ${unassignedStudents.length} unassigned members`);
            resp.send(unassignedStudents);
        } catch (error) {
            console.error('Error fetching unassigned groups:', error);
            resp.status(500).send({ error: 'Failed to fetch unassigned groups' });
        }
    });
}
