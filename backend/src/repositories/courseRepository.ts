import models from '../util/database';

const Course = models.Course;

class CourseRepository {
  async findById(courseId: number) {
    console.log(`Repository: Looking up course with ID: ${courseId}`);
    return await Course.findByPk(courseId);
  }
}

export default new CourseRepository();