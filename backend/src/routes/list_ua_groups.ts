import { FastifyInstance } from 'fastify';
import models from '../util/database';


export default async function (app: FastifyInstance) {
    const GroupMembers = models.Group_Member;
    const User = models.User;
    
    app.get<{ Params: { assignmentID: number } }>('/list_ua_groups/:assignmentID', async (req, resp) => {
        try {
            const aID = req.params.assignmentID;
            console.log(`Fetching unassigned groups for assignment ${aID}`);
            
            const members = await GroupMembers.findAll({
                where: {
                    groupID: -1,
                    assignmentID: aID
                },
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: true
                }]
            });
            
            console.log(`Found ${members.length} unassigned members`);
            
            // Transform the data to match frontend expectations
            const unassignedStudents = members.map((member: any) => ({
                id: member.User.id,
                name: member.User.name,
                email: member.User.email,
                userID: member.userID,
                groupID: member.groupID,
                assignmentID: member.assignmentID
            }));
            
            resp.send(unassignedStudents);
        } catch (error) {
            console.error('Error fetching unassigned groups:', error);
            resp.status(500).send({ error: 'Failed to fetch unassigned groups' });
        }
    });
}
