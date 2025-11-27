import models, { sequelize } from '../util/database';

const User = models.User;
const User_Course = models.User_Course;

interface CreateUserData {
  id: number;
  name: string;
  email: string;
  is_teacher: boolean;
  hash_pass: string;
}

class StudentRepository {
  async findByEmail(email: string) {
    console.log(`Repository: Looking up user with email: ${email}`);
    return await User.findOne({ where: { email } });
  }

  async createUser(userData: CreateUserData) {
    console.log(`Repository: Creating user with email: ${userData.email}`);
    return await User.create(userData);
  }

  async enrollUserInCourse(userId: number, courseId: number) {
    console.log(`Repository: Enrolling user ${userId} in course ${courseId}`);
    
    return await sequelize.transaction(async (t) => {
      // Check if enrollment already exists
      const existingEnrollment = await User_Course.findOne({
        where: {
          userID: userId,
          courseID: courseId,
        },
        transaction: t,
      });

      if (existingEnrollment) {
        console.log(`Repository: User ${userId} is already enrolled in course ${courseId}`);
        return { alreadyEnrolled: true };
      }

      // Create new enrollment
      await User_Course.create({
        userID: userId,
        courseID: courseId,
      }, { transaction: t });

      console.log(`Repository: Successfully enrolled user ${userId} in course ${courseId}`);
      return { alreadyEnrolled: false };
    }).catch(async (enrollmentError) => {
      console.error(`Repository: Error enrolling user ${userId} in course:`, enrollmentError);
      // If it's a duplicate key error, treat as already enrolled
      if (enrollmentError instanceof Error && enrollmentError.message.includes('ER_DUP_ENTRY')) {
        console.log(`Repository: Duplicate enrollment detected for user ${userId}, treating as already enrolled`);
        return { alreadyEnrolled: true };
      } else {
        throw enrollmentError; // Re-throw if it's not a duplicate error
      }
    });
  }

  async findStudentsByIds(studentIds: number[]) {
    console.log(`Repository: Looking up students with IDs: ${studentIds.join(', ')}`);
    return await User.findAll({
      where: {
        id: studentIds,
        is_teacher: false,
      },
    });
  }

  async addStudentToClass(studentId: number, courseId: number) {
    console.log(`Repository: Adding student ${studentId} to course ${courseId}`);
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
    return { created };
  }

  async removeStudentsFromClass(studentIds: number[], courseId: number) {
    console.log(`Repository: Removing students ${studentIds.join(', ')} from course ${courseId}`);
    return await User_Course.destroy({
      where: {
        userID: studentIds,
        courseID: courseId,
      },
    });
  }
}

export default new StudentRepository();