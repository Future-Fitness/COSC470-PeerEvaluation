import { FastifyInstance } from 'fastify';
import models from '../util/database';

export default async function (app: FastifyInstance) {
    const GroupMembers = models.Group_Member;
    // Route: GET /list_stu_group/:studentID - returns groups for a student
    app.get<{ Params: { studentID: number} }>('/list_stu_group/:studentID', async (req, resp) => {
        const sID = req.params.studentID;
        try {
            const groups = await GroupMembers.findAll({
                where: {
                    userID: sID
                }
            });
            resp.send(groups);
        } catch (error) {
            console.error('Error fetching student groups:', error);
            resp.status(500).send({ error: 'Failed to fetch student groups' });
        }
    });
}