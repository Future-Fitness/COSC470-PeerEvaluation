import { FastifyInstance, FastifyRequest } from 'fastify';
import models from '../util/database';
import { csv2json } from '../util/csv';
import { sha512 } from 'js-sha512';
import emailService from '../services/emailService';

const Course = models.Course;
const User = models.User;
const User_Course = models.User_Course;

interface UploadStudentsRequest extends FastifyRequest {
  body: {
    courseId: number;
  };
}

export default function (app: FastifyInstance) {
  app.post('/upload_students_csv', async (req: UploadStudentsRequest, resp) => {
    try {
      const parts = req.parts();
      let csvContent = '';
      let courseId: number | undefined;

      // Parse multipart form data
      for await (const part of parts) {
        if (part.type === 'field' && part.fieldname === 'courseId') {
          courseId = parseInt(part.value as string);
        } else if (part.type === 'file' && part.fieldname === 'file') {
          // Read the CSV file content
          const buffer = await part.toBuffer();
          csvContent = buffer.toString('utf-8');
        }
      }

      // Validate inputs
      if (!courseId) {
        resp.status(400).send({ error: 'Course ID is required' });
        return;
      }

      if (!csvContent) {
        resp.status(400).send({ error: 'CSV file is required' });
        return;
      }

      // Check if course exists
      const course = await Course.findByPk(courseId);
      if (!course) {
        resp.status(404).send({ error: 'Course not found' });
        return;
      }

      // Parse CSV content
      const parsed = csv2json(csvContent) as {
        id?: string;
        name?: string;
        email: string;
        password?: string;
      }[];

      if (!parsed || parsed.length === 0) {
        resp.status(400).send({ error: 'CSV file is empty or invalid' });
        return;
      }

      // Validate that all rows have email
      const invalidRows = parsed.filter(row => !row.email);
      if (invalidRows.length > 0) {
        resp.status(400).send({
          error: `${invalidRows.length} row(s) missing email address`
        });
        return;
      }

      const defaultStudentPassword = process.env.DEFAULT_STUDENT_PASSWORD || 'letmein';
      const loginUrl = process.env.LOGIN_URL || 'http://localhost:5009/login';
      const results = {
        added: [] as string[],
        alreadyEnrolled: [] as string[],
        errors: [] as { email: string; error: string }[],
        newUsers: [] as { email: string; password: string }[],
      };

      // Process each student
      for (const studentData of parsed) {
        try {
          const email = studentData.email.trim();
          
          // Find or create user by email
          let user = await User.findOne({ where: { email } });

          let isNewUser = false;
          let userPassword = '';
          
          if (!user) {
            // Create new user
            // Generate random ID if not provided (5-digit random number)
            // Handle empty strings and null values
            const hasId = studentData.id && studentData.id.toString().trim() !== '';
            const studentId = hasId ? parseInt(studentData.id) : Math.floor(10000 + Math.random() * 90000);
            const name = studentData.name?.trim() || email.split('@')[0];
            const password = studentData.password?.trim() || defaultStudentPassword;
            userPassword = password;
            isNewUser = true;

            user = await User.create({
              id: studentId,
              name,
              email,
              is_teacher: false,
              hash_pass: sha512(password),
            });

            console.log(`Created new user: ${email} with ID: ${studentId}`);
          } else if (user.is_teacher) {
            results.errors.push({
              email,
              error: 'User is a teacher and cannot be added as student'
            });
            continue;
          }

          // Add user to course
          const [, created] = await User_Course.findOrCreate({
            where: {
              userID: user.id,
              courseID: courseId,
            },
            defaults: {
              userID: user.id,
              courseID: courseId,
            },
          });

          if (created) {
            results.added.push(email);
            // Track new users for email notification
            if (isNewUser) {
              results.newUsers.push({
                email,
                password: userPassword,
              });
            }
          } else {
            results.alreadyEnrolled.push(email);
          }
        } catch (error) {
          console.error(`Error processing student ${studentData.email}:`, error);
          results.errors.push({
            email: studentData.email,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Send email notifications to newly created users
      if (results.newUsers.length > 0) {
        const emailData = results.newUsers.map(user => ({
          email: user.email,
          courseName: course.name,
          temporaryPassword: user.password,
          loginUrl,
        }));

        try {
          const emailResults = await emailService.sendBulkNewStudentEmails(emailData);
          console.log(`Sent ${emailResults.sent.length} emails, ${emailResults.failed.length} failed`);
        } catch (error) {
          console.error('Error sending emails:', error);
          // Don't fail the entire request if emails fail
        }
      }

      resp.send({
        message: `Successfully processed ${parsed.length} student(s)`,
        addedCount: results.added.length,
        alreadyEnrolledCount: results.alreadyEnrolled.length,
        errorCount: results.errors.length,
        newUsersCount: results.newUsers.length,
        results,
      });
    } catch (error) {
      console.error('Error uploading students CSV:', error);
      resp.status(500).send({
        error: 'Failed to upload students CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
