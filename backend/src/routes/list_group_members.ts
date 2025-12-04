import { FastifyInstance } from 'fastify';
import models from '../util/database';
import { listGroupMembers } from '../services/groupService';

type GroupMemberWithUser = {
    userID: number;
    groupID: string;
    assignmentID: number;
    User?: {
        id: number;
        name: string;
        email: string;
    };
};

export default async function (app: FastifyInstance) {
    const GroupMembers = models.Group_Member;
    const User = models.User;
    
    app.get<{ Params: { assignmentID: number, groupID: string } }>('/list_group_members/:assignmentID/:groupID', async (req, resp) => {
        try {
            const aID = req.params.assignmentID;
            const gID = req.params.groupID;
            console.log(`Fetching members for group ${gID} in assignment ${aID}`);
            
            const groupMembers = await listGroupMembers(aID, gID);
            console.log(`Found ${groupMembers.length} members in group ${gID}`);
            
            resp.send(groupMembers);
        } catch (error) {
            console.error('Error fetching group members:', error);
            resp.status(500).send({ error: 'Failed to fetch group members' });
        }
    });
}