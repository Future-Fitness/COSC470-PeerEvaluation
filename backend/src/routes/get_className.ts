import { FastifyInstance } from 'fastify';
import models from '../util/database';


export default async function (app: FastifyInstance) {
    const CourseModel = models.Course;
    app.get<{ Params: { classID: number } }>('/get_className/:classID', async (req, resp) => {
        const cID = req.params.classID;
        
        try {
            const classData = await CourseModel.findOne({
                where: { id: cID },
            });

            if (!classData) {
                resp.status(404).send({ error: 'Class not found' });
                return;
            }

            resp.send({ className: classData.name });
        } catch (error) {
            console.error('Error fetching class name:', error);
            resp.status(500).send({ error: 'Failed to fetch class name' });
        }
    });
}
