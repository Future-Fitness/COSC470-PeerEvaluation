import { FastifyInstance } from 'fastify';
import getStudents from './get_students';
import addStudents from './add_students';
import studentImport from './student_import';
import uploadStudentsCsv from './upload_students_csv';

export default function registerStudentRoutes(app: FastifyInstance) {
  getStudents(app);
  addStudents(app);
  studentImport(app);
  uploadStudentsCsv(app);
}
