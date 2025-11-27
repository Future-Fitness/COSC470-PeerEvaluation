import { FastifyInstance, FastifyRequest } from 'fastify';
import models, { sequelize } from '../util/database';
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
    console.log('=== UPLOAD STUDENTS CSV API STARTED ===');
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    
    try {
      console.log('Parsing multipart form data...');
      const parts = req.parts();
      let csvContent = '';
      let courseId: number | undefined;

      // Parse multipart form data
      for await (const part of parts) {
        console.log(`Processing part: ${part.fieldname}, type: ${part.type}`);
        if (part.type === 'field' && part.fieldname === 'courseId') {
          courseId = parseInt(part.value as string);
          console.log(`Extracted courseId: ${courseId}`);
        } else if (part.type === 'file' && part.fieldname === 'file') {
          // Read the CSV file content
          const buffer = await part.toBuffer();
          csvContent = buffer.toString('utf-8');
          console.log(`CSV file received, size: ${buffer.length} bytes`);
          console.log(`CSV content preview: ${csvContent.substring(0, 200)}...`);
        }
      }

      // Validate inputs
      console.log('Validating inputs...');
      if (!courseId) {
        console.log('ERROR: Course ID is missing');
        resp.status(400).send({ error: 'Course ID is required' });
        return;
      }

      if (!csvContent) {
        console.log('ERROR: CSV content is missing');
        resp.status(400).send({ error: 'CSV file is required' });
        return;
      }

      // Check if course exists
      console.log(`Looking up course with ID: ${courseId}`);
      const course = await Course.findByPk(courseId);
      if (!course) {
        console.log(`ERROR: Course with ID ${courseId} not found`);
        resp.status(404).send({ error: 'Course not found' });
        return;
      }
      console.log(`Course found: ${course.name}`);

      // Parse CSV content
      console.log('Parsing CSV content...');
      const parsed = csv2json(csvContent) as {
        id?: string;
        name?: string;
        email: string;
        password?: string;
      }[];

      console.log(`Parsed ${parsed?.length || 0} rows from CSV`);
      if (!parsed || parsed.length === 0) {
        console.log('ERROR: CSV file is empty or invalid');
        resp.status(400).send({ error: 'CSV file is empty or invalid' });
        return;
      }

      console.log('Sample parsed data:', parsed.slice(0, 3));

      // Validate that all rows have email
      const invalidRows = parsed.filter(row => !row.email);
      if (invalidRows.length > 0) {
        console.log(`ERROR: ${invalidRows.length} row(s) missing email address`);
        console.log('Invalid rows:', invalidRows);
        resp.status(400).send({
          error: `${invalidRows.length} row(s) missing email address`
        });
        return;
      }
      console.log('All rows have valid email addresses');

      // Function to generate random password
      const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 10; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };
      const loginUrl = process.env.LOGIN_URL || 'http://localhost:5009/login';
      const results = {
        added: [] as string[],
        alreadyEnrolled: [] as string[],
        errors: [] as { email: string; error: string }[],
        newUsers: [] as { email: string; password: string }[],
      };

      // Process each student
      console.log(`Starting to process ${parsed.length} students...`);
      for (const studentData of parsed) {
        try {
          const email = studentData.email.trim();
          console.log(`\n--- Processing student: ${email} ---`);
          
          // Find or create user by email
          console.log(`Looking up existing user for: ${email}`);
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
            // Always generate random password (ignore CSV password field)
            const password = generatePassword();
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
          console.log(`Attempting to enroll user ${user.id} in course ${courseId}`);
          try {
            await sequelize.transaction(async (t) => {
              // Check if enrollment already exists
              const existingEnrollment = await User_Course.findOne({
                where: {
                  userID: user.id,
                  courseID: courseId,
                },
                transaction: t,
              });

              if (existingEnrollment) {
                console.log(`User ${email} (ID: ${user.id}) is already enrolled in course ${courseId}`);
                results.alreadyEnrolled.push(email);
                // Still add to newUsers if this was a newly created user
                if (isNewUser) {
                  console.log(`New user ${email} was already enrolled, but adding to newUsers for email notification`);
                  results.newUsers.push({
                    email,
                    password: userPassword,
                  });
                }
                return;
              }

              // Create new enrollment
              await User_Course.create({
                userID: user.id,
                courseID: courseId,
              }, { transaction: t });

              console.log(`Successfully enrolled ${email} (ID: ${user.id}) in course ${courseId}`);
              results.added.push(email);
              
              // Track new users for email notification
              if (isNewUser) {
                console.log(`Adding new user ${email} to newUsers list for email notification`);
                results.newUsers.push({
                  email,
                  password: userPassword,
                });
              }
            });
          } catch (enrollmentError) {
            console.error(`Error enrolling user ${email} in course:`, enrollmentError);
            // If it's a duplicate key error, treat as already enrolled
            if (enrollmentError instanceof Error && enrollmentError.message.includes('ER_DUP_ENTRY')) {
              console.log(`Duplicate enrollment detected for ${email}, treating as already enrolled`);
              results.alreadyEnrolled.push(email);
              if (isNewUser) {
                results.newUsers.push({
                  email,
                  password: userPassword,
                });
              }
            } else {
              throw enrollmentError; // Re-throw if it's not a duplicate error
            }
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
      console.log(`Processing email notifications for ${results.newUsers.length} new users`);
      if (results.newUsers.length > 0) {
        console.log('New users for email notification:', results.newUsers.map(u => u.email));
        
        const emailData = results.newUsers.map(user => ({
          email: user.email,
          courseName: course.name,
          temporaryPassword: user.password,
          loginUrl,
        }));

        try {
          console.log(`Attempting to send ${emailData.length} email notifications...`);
          const emailResults = await emailService.sendBulkNewStudentEmails(emailData);
          console.log(`Email notification results: ${emailResults.sent.length} sent, ${emailResults.failed.length} failed`);
          if (emailResults.sent.length > 0) {
            console.log('Successfully sent emails to:', emailResults.sent);
          }
          if (emailResults.failed.length > 0) {
            console.log('Failed to send emails to:', emailResults.failed);
          }
        } catch (error) {
          console.error('Error sending emails:', error);
          // Don't fail the entire request if emails fail
        }
      } else {
        console.log('No new users to send email notifications to');
      }

      const responseData = {
        message: `Successfully processed ${parsed.length} student(s)`,
        addedCount: results.added.length,
        alreadyEnrolledCount: results.alreadyEnrolled.length,
        errorCount: results.errors.length,
        newUsersCount: results.newUsers.length,
        results,
      };
      
      console.log('\n=== UPLOAD COMPLETED SUCCESSFULLY ===');
      console.log('Final results:', responseData);
      console.log('=== END UPLOAD STUDENTS CSV API ===\n');
      
      resp.send(responseData);
    } catch (error) {
      console.error('\n=== UPLOAD STUDENTS CSV ERROR ===');
      console.error('Error uploading students CSV:', error);
      console.error('=== END ERROR ===\n');
      resp.status(500).send({
        error: 'Failed to upload students CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
