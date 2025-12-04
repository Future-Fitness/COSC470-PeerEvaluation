import { FastifyInstance } from 'fastify';
import models from '../../../util/database';
import { csv2json } from '../../../util/csv';
import { sha512 } from 'js-sha512';

export default function (app: FastifyInstance) {
  const Course = models.Course;
  const User = models.User;
  const User_Course = models.User_Course;

  app.post('/student_import', async (req, resp) => {
    const data = req.body as {
      students: string
      courseID: number
    };

    // Check if class exists
    const course = await Course.findOne({
      where: {
        id: data.courseID,
      }
    });

    if (!course) {
      resp.status(400).send({
        message: 'Class does not exist'
      });
      return;
    }

    const defaultStudentPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'letmein'; // Default to 'letmein' if env var is not set

    try {
      const parsed = csv2json(data.students) as {
        name: string,
        email: string,
      }[];

      // Insert the students
      const students = await Promise.all(parsed.map(async student => {
        const email = student.email;
        const name = student.name;

        // All fields are auto-generated except email and name
        const defaults: any = {
          name: name,
          email: email,
          is_teacher: false,
          hash_pass: sha512(defaultStudentPassword),
        };

        const [user] = await User.findOrCreate({
          where: {
            email: email
          },
          defaults: defaults
        });

        return user;
      }));

      // Add every user to the course
      await Promise.all(students.map(async student => {
        await User_Course.create({
          userID: student.id,
          courseID: course.id,
        });
      }));

      resp.status(200).send({
        message: students.length + ' students added to course ' + course.name,
      });
    } catch (err) {
      console.error(err);
      resp.status(500).send({});
      return;
    }
  });
}