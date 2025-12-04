import { FastifyInstance } from 'fastify';
import models from '../../../util/database';

export default function (app: FastifyInstance){
    const assignments = models.Assignment;
    
    app.get<{Params: {course : string}}>('/assignments/:course', async (req, resp) =>{
        const course = req.params.course + '';
        const current = await assignments.findAll({
            where: {
                courseID: course
            }
        });

        resp.send(current);
    });

    app.get<{Params: {id : string}}>('/assignments/:id/details', async (req, resp) =>{
        const assignmentId = parseInt(req.params.id); // Parse id to integer
        if (isNaN(assignmentId)) {
            resp.status(400).send({ error: 'Invalid assignment ID' });
            return;
        }

        const assignment = await assignments.findByPk(assignmentId);

        if (!assignment) {
            resp.status(404).send({ error: 'Assignment not found' });
            return;
        }

        resp.send(assignment);
    });
}