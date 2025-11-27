import { FastifyInstance } from 'fastify';
import models from '../util/database';

export default async function (app: FastifyInstance) {
    const GroupMembers = models.Group_Member;
    const User = models.User;
    
    app.get<{ Params: { assignmentID: number, groupID: string } }>('/list_group_members/:assignmentID/:groupID', async (req, resp) => {
        try {
            const aID = req.params.assignmentID;
            const gID = req.params.groupID;
            console.log(`Fetching members for group ${gID} in assignment ${aID}`);
            
            const members = await GroupMembers.findAll({
                where: {
                    groupID: gID,
                    assignmentID: aID
                },
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: true
                }]
            });
            
            console.log(`Found ${members.length} members in group ${gID}`);
            
            // Transform the data to match frontend expectations
            const groupMembers = members.map((member: any) => {
                if (member.User) {
                    return {
                        id: member.User.id,
                        name: member.User.name,
                        email: member.User.email,
                        userID: member.userID,
                        groupID: member.groupID,
                        assignmentID: member.assignmentID
                    };
                } else {
                    console.error('User object is undefined for member:', member);
                    return null; // or handle this case as needed
                }
            }).filter(Boolean); // Remove null values
            
            resp.send(groupMembers);
        } catch (error) {
            console.error('Error fetching group members:', error);
            resp.status(500).send({ error: 'Failed to fetch group members' });
        }
    });
}