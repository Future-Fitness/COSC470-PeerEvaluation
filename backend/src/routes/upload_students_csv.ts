import { FastifyInstance } from 'fastify';
import studentController from '../controllers/studentController';

export default function (app: FastifyInstance) {
  app.post('/upload_students_csv', studentController.uploadStudentsCSV.bind(studentController));
}
