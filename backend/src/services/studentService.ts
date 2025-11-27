import { csv2json } from '../util/csv';
import { sha512 } from 'js-sha512';
import emailService from './emailService';
import studentRepository from '../repositories/studentRepository';
import courseRepository from '../repositories/courseRepository';

interface StudentData {
  id?: string;
  name?: string;
  email: string;
  password?: string;
}

interface ProcessResult {
  message: string;
  addedCount: number;
  alreadyEnrolledCount: number;
  errorCount: number;
  newUsersCount: number;
  results: {
    added: string[];
    alreadyEnrolled: string[];
    errors: { email: string; error: string }[];
    newUsers: { email: string; password: string }[];
  };
}

class StudentService {
  private generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async processStudentsCSV(courseId: number, csvContent: string): Promise<ProcessResult> {
    // Check if course exists
    console.log(`Looking up course with ID: ${courseId}`);
    const course = await courseRepository.findById(courseId);
    if (!course) {
      console.log(`ERROR: Course with ID ${courseId} not found`);
      throw new Error('Course not found');
    }
    console.log(`Course found: ${course.name}`);

    // Parse CSV content
    console.log('Parsing CSV content...');
    const parsed = csv2json(csvContent) as StudentData[];

    console.log(`Parsed ${parsed?.length || 0} rows from CSV`);
    if (!parsed || parsed.length === 0) {
      console.log('ERROR: CSV file is empty or invalid');
      throw new Error('CSV file is empty or invalid');
    }

    console.log('Sample parsed data:', parsed.slice(0, 3));

    // Validate that all rows have email
    const invalidRows = parsed.filter(row => !row.email);
    if (invalidRows.length > 0) {
      console.log(`ERROR: ${invalidRows.length} row(s) missing email address`);
      console.log('Invalid rows:', invalidRows);
      throw new Error(`${invalidRows.length} row(s) missing email address`);
    }
    console.log('All rows have valid email addresses');

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
        
        const result = await this.processIndividualStudent(studentData, courseId);
        
        // Categorize result
        switch (result.status) {
          case 'added':
            results.added.push(email);
            if (result.isNewUser && result.password) {
              results.newUsers.push({ email, password: result.password });
            }
            break;
          case 'already_enrolled':
            results.alreadyEnrolled.push(email);
            if (result.isNewUser && result.password) {
              results.newUsers.push({ email, password: result.password });
            }
            break;
          case 'error':
            results.errors.push({ email, error: result.error || 'Unknown error' });
            break;
        }
      } catch (error) {
        console.error(`Error processing student ${studentData.email}:`, error);
        results.errors.push({
          email: studentData.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Send email notifications
    await this.sendEmailNotifications(results.newUsers, course.name, loginUrl);

    return {
      message: `Successfully processed ${parsed.length} student(s)`,
      addedCount: results.added.length,
      alreadyEnrolledCount: results.alreadyEnrolled.length,
      errorCount: results.errors.length,
      newUsersCount: results.newUsers.length,
      results,
    };
  }

  private async processIndividualStudent(studentData: StudentData, courseId: number) {
    const email = studentData.email.trim();
    
    // Find or create user by email
    console.log(`Looking up existing user for: ${email}`);
    let user = await studentRepository.findByEmail(email);

    let isNewUser = false;
    let userPassword = '';
    
    if (!user) {
      // Create new user
      const hasId = studentData.id && studentData.id.toString().trim() !== '';
      const studentId = hasId ? parseInt(studentData.id) : Math.floor(10000 + Math.random() * 90000);
      const name = studentData.name?.trim() || email.split('@')[0];
      const password = this.generatePassword();
      userPassword = password;
      isNewUser = true;

      user = await studentRepository.createUser({
        id: studentId,
        name,
        email,
        is_teacher: false,
        hash_pass: sha512(password),
      });

      console.log(`Created new user: ${email} with ID: ${studentId}`);
    } else if (user.is_teacher) {
      return {
        status: 'error' as const,
        error: 'User is a teacher and cannot be added as student',
        isNewUser: false
      };
    }

    // Enroll user in course
    console.log(`Attempting to enroll user ${user.id} in course ${courseId}`);
    const enrollmentResult = await studentRepository.enrollUserInCourse(user.id, courseId);
    
    if (enrollmentResult.alreadyEnrolled) {
      console.log(`User ${email} (ID: ${user.id}) is already enrolled in course ${courseId}`);
      return {
        status: 'already_enrolled' as const,
        isNewUser,
        password: userPassword
      };
    }

    console.log(`Successfully enrolled ${email} (ID: ${user.id}) in course ${courseId}`);
    return {
      status: 'added' as const,
      isNewUser,
      password: userPassword
    };
  }

  private async sendEmailNotifications(newUsers: { email: string; password: string }[], courseName: string, loginUrl: string) {
    console.log(`Processing email notifications for ${newUsers.length} new users`);
    if (newUsers.length > 0) {
      console.log('New users for email notification:', newUsers.map(u => u.email));
      
      const emailData = newUsers.map(user => ({
        email: user.email,
        courseName,
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
  }

  async addStudentsToClass(courseId: number, studentIds: number[]) {
    // Validate course exists
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Verify all students exist and are not teachers
    const students = await studentRepository.findStudentsByIds(studentIds);
    if (students.length !== studentIds.length) {
      throw new Error('Some student IDs are invalid or belong to teachers');
    }

    // Add students to course (skip if already enrolled)
    const addedStudents = [];
    const alreadyEnrolled = [];

    for (const studentId of studentIds) {
      const result = await studentRepository.addStudentToClass(studentId, courseId);
      if (result.created) {
        addedStudents.push(studentId);
      } else {
        alreadyEnrolled.push(studentId);
      }
    }

    return {
      message: `Successfully added ${addedStudents.length} student(s) to course`,
      addedCount: addedStudents.length,
      alreadyEnrolledCount: alreadyEnrolled.length,
      addedStudents,
      alreadyEnrolled,
    };
  }

  async removeStudentsFromClass(courseId: number, studentIds: number[]) {
    const deletedCount = await studentRepository.removeStudentsFromClass(studentIds, courseId);
    
    return {
      message: `Successfully removed ${deletedCount} student(s) from course`,
      removedCount: deletedCount,
    };
  }
}

export default new StudentService();