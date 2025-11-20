import { FastifyInstance } from 'fastify';
import models from '../util/database';

const Course = models.Course;
const User = models.User;
const User_Course = models.User_Course;

export default function (app: FastifyInstance) {
  // Add students to a course
  app.post('/add_students_to_class', async (req, resp) => {
    try {
      const { courseId, studentIds } = req.body as {
        courseId: number;
        studentIds: number[];
      };

      // Validate inputs
      if (!courseId) {
        resp.status(400).send({ error: 'Course ID is required' });
        return;
      }

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        resp.status(400).send({ error: 'Student IDs array is required' });
        return;
      }

      // Check if course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        resp.status(404).send({ error: 'Course not found' });
        return;
      }

      // Verify all students exist
      const students = await User.findAll({
        where: {
          id: studentIds,
          is_teacher: false,
        },
      });

      if (students.length !== studentIds.length) {
        resp.status(400).send({
          error: 'Some student IDs are invalid or belong to teachers'
        });
        return;
      }

      // Add students to course (skip if already enrolled)
      const addedStudents = [];
      const alreadyEnrolled = [];

      for (const studentId of studentIds) {
        const [, created] = await User_Course.findOrCreate({
          where: {
            userID: studentId,
            courseID: courseId,
          },
          defaults: {
            userID: studentId,
            courseID: courseId,
          },
        });

        if (created) {
          addedStudents.push(studentId);
        } else {
          alreadyEnrolled.push(studentId);
        }
      }

      resp.send({
        message: `Successfully added ${addedStudents.length} student(s) to course`,
        addedCount: addedStudents.length,
        alreadyEnrolledCount: alreadyEnrolled.length,
        addedStudents,
        alreadyEnrolled,
      });
    } catch (error) {
      console.error('Error adding students to course:', error);
      resp.status(500).send({
        error: 'Failed to add students to course',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Remove students from a course
  app.post('/remove_students_from_class', async (req, resp) => {
    try {
      const { courseId, studentIds } = req.body as {
        courseId: number;
        studentIds: number[];
      };

      // Validate inputs
      if (!courseId) {
        resp.status(400).send({ error: 'Course ID is required' });
        return;
      }

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        resp.status(400).send({ error: 'Student IDs array is required' });
        return;
      }

      // Remove students from course
      const deletedCount = await User_Course.destroy({
        where: {
          userID: studentIds,
          courseID: courseId,
        },
      });

      resp.send({
        message: `Successfully removed ${deletedCount} student(s) from course`,
        removedCount: deletedCount,
      });
    } catch (error) {
      console.error('Error removing students from course:', error);
      resp.status(500).send({
        error: 'Failed to remove students from course',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
