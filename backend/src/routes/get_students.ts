import { FastifyInstance } from 'fastify';
import models from '../util/database';

const User = models.User;
const User_Course = models.User_Course;

export default function (app: FastifyInstance) {
  // Get all students (not enrolled in a specific class)
  app.get<{ Params: { courseId: string } }>('/students/available/:courseId', async (req, resp) => {
    try {
      const { courseId } = req.params;

      // Get all students
      const allStudents = await User.findAll({
        where: {
          is_teacher: false,
        },
        attributes: ['id', 'name', 'email'],
      });

      // Get students already in this course
      const enrolledStudents = await User_Course.findAll({
        where: {
          courseID: courseId,
        },
      });

      const enrolledIds = new Set(enrolledStudents.map(uc => uc.userID));

      // Filter out already enrolled students
      const availableStudents = allStudents.filter(
        student => !enrolledIds.has(student.id)
      );

      resp.send(availableStudents);
    } catch (error) {
      console.error('Error fetching available students:', error);
      resp.status(500).send({ error: 'Failed to fetch students' });
    }
  });

  // Get all students (for general listing)
  app.get('/students', async (req, resp) => {
    try {
      const students = await User.findAll({
        where: {
          is_teacher: false,
        },
        attributes: ['id', 'name', 'email'],
        order: [['name', 'ASC']],
      });

      resp.send(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      resp.status(500).send({ error: 'Failed to fetch students' });
    }
  });

  // Get enrolled students for a course
  app.get<{ Params: { courseId: string } }>('/students/enrolled/:courseId', async (req, resp) => {
    try {
      const { courseId } = req.params;

      // Get enrolled user IDs
      const enrollments = await User_Course.findAll({
        where: {
          courseID: courseId,
        },
      });

      // Get user details
      const studentIds = enrollments.map(e => e.userID);
      const students = await User.findAll({
        where: {
          id: studentIds,
          is_teacher: false,
        },
        attributes: ['id', 'name', 'email'],
        order: [['name', 'ASC']],
      });

      resp.send(students);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
      resp.status(500).send({ error: 'Failed to fetch enrolled students' });
    }
  });
}
