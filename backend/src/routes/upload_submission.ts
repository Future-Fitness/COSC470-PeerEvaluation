import { FastifyInstance } from 'fastify';
import cloudinary from '../util/cloudinary';
import models from '../util/database';

const Submission = models.Submission;

export default function (app: FastifyInstance) {
  app.post('/upload_submission', async (req, resp) => {
    try {
      console.log('Upload request received');
      console.log('Headers:', req.headers);
      
      // Get the multipart data
      const parts = await req.parts();
      
      let file: Awaited<ReturnType<typeof parts.next>>['value'] | null = null;
      let assignmentID: string | undefined;
      
      // Process all parts
      for await (const part of parts) {
        if (part.type === 'file') {
          console.log('File part received:', part.filename);
          file = part;
        } else {
          // Field
          console.log('Field received:', part.fieldname, '=', part.value);
          if (part.fieldname === 'assignmentID') {
            assignmentID = part.value as string;
          }
        }
      }

      if (!file) {
        console.error('No file in request');
        resp.status(400).send({ error: 'No file uploaded' });
        return;
      }
      
      console.log('Parsed assignment ID:', assignmentID);

      if (!assignmentID) {
        console.error('No assignment ID provided');
        resp.status(400).send({ error: 'Assignment ID is required' });
        return;
      }

      // Get authenticated user from session
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        resp.status(401).send({ error: 'Unauthorized' });
        return;
      }

      // @ts-expect-error session is added by middleware
      const session = app.session[token];
      if (!session) {
        resp.status(401).send({ error: 'Invalid session' });
        return;
      }

      const studentID = session.id;

      // Create a promise to upload to Cloudinary
      const uploadPromise = new Promise<{secure_url: string; public_id: string; format: string; resource_type: string}>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `submissions/${assignmentID}`,
            resource_type: 'auto', // Automatically detect file type
            public_id: `student_${studentID}_${Date.now()}`,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Pipe the file stream to Cloudinary
        file.file.pipe(uploadStream);
      });

      // Wait for upload to complete
      const uploadResult = await uploadPromise;

      // Check if student already has a submission for this assignment
      const existingSubmission = await Submission.findOne({
        where: {
          studentID,
          assignmentID,
        },
      });

      let submission;
      if (existingSubmission) {
        // Update existing submission
        await existingSubmission.update({
          path: uploadResult.secure_url,
        });
        submission = existingSubmission;
      } else {
        // Create new submission
        submission = await Submission.create({
          path: uploadResult.secure_url,
          studentID,
          assignmentID: parseInt(assignmentID as string),
        });
      }

      resp.send({
        message: 'File uploaded successfully',
        submission: {
          id: submission.id,
          path: submission.path,
          studentID: submission.studentID,
          assignmentID: submission.assignmentID,
        },
        cloudinary: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          resourceType: uploadResult.resource_type,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      resp.status(500).send({
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
