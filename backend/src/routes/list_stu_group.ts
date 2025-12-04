import { FastifyInstance } from 'fastify';
// import models from '../util/database';
import { listStudentGroups } from '../services/groupService';

export default async function (app: FastifyInstance) {
    // using service layer; no direct model access here
    // Route: GET /list_stu_group/:studentID - returns groups for a student
    app.get<{ Params: { studentID: string } }>('/list_stu_group/:studentID', async (req, resp) => {
        const sID = parseInt(req.params.studentID, 10);
        try {
            const groups = await listStudentGroups(sID);
            resp.send(groups);
        } catch (error) {
            console.error('Error fetching student groups:', error);
            resp.status(500).send({ error: 'Failed to fetch student groups' });
        }
    });
}