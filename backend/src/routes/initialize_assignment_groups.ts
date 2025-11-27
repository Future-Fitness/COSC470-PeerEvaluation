import { FastifyInstance } from 'fastify';
import models from '../util/database';

export default function (app: FastifyInstance) {
  app.post('/initialize_assignment_groups', async (req, resp) => {
    try {
      const { assignmentID } = req.body as { assignmentID: number };
      
      if (!assignmentID) {
        return resp.status(400).send({ error: 'Assignment ID is required' });
      }

      console.log(`Initializing group members for assignment ${assignmentID}`);

      const GroupMembers = models.Group_Member;
      const UserCourses = models.User_Course;
      const Assignment = models.Assignment;

      // Get the assignment to find the course
      const assignment = await Assignment.findByPk(assignmentID);
      if (!assignment) {
        return resp.status(404).send({ error: 'Assignment not found' });
      }

      // Get all students enrolled in the course
      const enrolledUsers = await UserCourses.findAll({
        where: {
          courseID: assignment.courseID
        }
      });

      // Check which students are already in the Group_Members table for this assignment
      const existingMembers = await GroupMembers.findAll({
        where: {
          assignmentID: assignmentID
        }
      });

      const existingUserIds = existingMembers.map(member => member.userID);
      
      // Add missing students to Group_Members with groupID = -1 (unassigned)
      const newMembers = [];
      for (const user of enrolledUsers) {
        if (!existingUserIds.includes(user.userID)) {
          newMembers.push({
            groupID: -1,
            userID: user.userID,
            assignmentID: assignmentID
          });
        }
      }

      if (newMembers.length > 0) {
        await GroupMembers.bulkCreate(newMembers);
        console.log(`Added ${newMembers.length} students to assignment ${assignmentID}`);
      }

      resp.send({
        message: 'Assignment groups initialized successfully',
        addedStudents: newMembers.length,
        existingStudents: existingMembers.length
      });

    } catch (error) {
      console.error('Error initializing assignment groups:', error);
      resp.status(500).send({ 
        error: 'Failed to initialize assignment groups',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}