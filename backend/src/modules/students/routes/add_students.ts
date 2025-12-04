import { FastifyInstance } from 'fastify';
import studentController from '../../../controllers/studentController';

export default function (app: FastifyInstance) {
  app.post('/add_students_to_class', studentController.addStudentsToClass.bind(studentController));
  app.post('/remove_students_from_class', studentController.removeStudentsFromClass.bind(studentController));
}
