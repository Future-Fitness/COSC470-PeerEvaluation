import { FastifyInstance } from 'fastify';
import models from '../util/database';

export default async function (app: FastifyInstance) {
    const CourseGroup = models.CourseGroup;
    app.get<{ Params: { assignmentID: number } }>('/list_all_groups/:assignmentID', async (req, resp) => {
        try {
            const aID = req.params.assignmentID;
            console.log(`Fetching all groups for assignment ${aID}`);
            
            const groups = await CourseGroup.findAll({
                where: {
                    assignmentID: aID
                }
            });
            
            console.log(`Found ${groups.length} groups`);
            resp.send(groups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            resp.status(500).send({ error: 'Failed to fetch groups' });
        }
    });
}