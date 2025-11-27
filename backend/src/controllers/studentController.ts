import { FastifyRequest, FastifyReply } from 'fastify';
import studentService from '../services/studentService';

interface UploadStudentsRequest extends FastifyRequest {
  body: {
    courseId: number;
  };
}

class StudentController {
  async uploadStudentsCSV(req: UploadStudentsRequest, reply: FastifyReply) {
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
        return reply.status(400).send({ error: 'Course ID is required' });
      }

      if (!csvContent) {
        console.log('ERROR: CSV content is missing');
        return reply.status(400).send({ error: 'CSV file is required' });
      }

      // Process CSV through service layer
      const result = await studentService.processStudentsCSV(courseId, csvContent);
      
      console.log('\n=== UPLOAD COMPLETED SUCCESSFULLY ===');
      console.log('Final results:', result);
      console.log('=== END UPLOAD STUDENTS CSV API ===\n');
      
      return reply.send(result);
    } catch (error) {
      console.error('\n=== UPLOAD STUDENTS CSV ERROR ===');
      console.error('Error uploading students CSV:', error);
      console.error('=== END ERROR ===\n');
      return reply.status(500).send({
        error: 'Failed to upload students CSV',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async addStudentsToClass(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { courseId, studentIds } = req.body as {
        courseId: number;
        studentIds: number[];
      };

      // Validate inputs
      if (!courseId) {
        return reply.status(400).send({ error: 'Course ID is required' });
      }

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return reply.status(400).send({ error: 'Student IDs array is required' });
      }

      const result = await studentService.addStudentsToClass(courseId, studentIds);
      return reply.send(result);
    } catch (error) {
      console.error('Error adding students to course:', error);
      return reply.status(500).send({
        error: 'Failed to add students to course',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async removeStudentsFromClass(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { courseId, studentIds } = req.body as {
        courseId: number;
        studentIds: number[];
      };

      // Validate inputs
      if (!courseId) {
        return reply.status(400).send({ error: 'Course ID is required' });
      }

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return reply.status(400).send({ error: 'Student IDs array is required' });
      }

      const result = await studentService.removeStudentsFromClass(courseId, studentIds);
      return reply.send(result);
    } catch (error) {
      console.error('Error removing students from course:', error);
      return reply.status(500).send({
        error: 'Failed to remove students from course',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default new StudentController();