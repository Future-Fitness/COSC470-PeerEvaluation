import { FastifyRequest, FastifyReply } from 'fastify';
import { createOrUpdateSubmission, getSubmission, getSubmissionsByAssignment } from '../services/submissionService';
import models from '../util/database';

const User = models.User;

/**
 * Controller for handling file upload requests
 */
export async function uploadSubmissionController(
  req: FastifyRequest,
  resp: FastifyReply,
  getSession: (token: string) => { id: number; email: string } | undefined
) {
  try {
    // Get the multipart data
    const parts = await req.parts();
    
    let file: { file: NodeJS.ReadableStream; filename: string } | null = null;
    let assignmentID: string | undefined;
    
    // Process all parts
    for await (const part of parts) {
      if (part.type === 'file') {
        file = part as { file: NodeJS.ReadableStream; filename: string };
      } else if (part.fieldname === 'assignmentID') {
        assignmentID = part.value as string;
      }
    }

    // Validate file
    if (!file) {
      return resp.status(400).send({ error: 'No file uploaded' });
    }

    // Validate assignment ID
    if (!assignmentID) {
      return resp.status(400).send({ error: 'Assignment ID is required' });
    }

    // Get authenticated user
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return resp.status(401).send({ error: 'Unauthorized' });
    }

    const session = getSession(token);
    if (!session) {
      return resp.status(401).send({ error: 'Invalid session' });
    }

    const studentID = session.id;

    // Upload and save submission
    const result = await createOrUpdateSubmission(
      file.file,
      studentID,
      parseInt(assignmentID)
    );

    return resp.send({
      message: 'File uploaded successfully',
      submission: result.submission,
      cloudinary: {
        url: result.upload.url,
        publicId: result.upload.publicId,
        format: result.upload.format,
        resourceType: result.upload.resourceType,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return resp.status(500).send({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get current user's submission for an assignment
 */
export async function getMySubmissionController(
  req: FastifyRequest<{ Params: { assignmentID: string } }>,
  resp: FastifyReply,
  getSession: (token: string) => { id: number; email: string } | undefined
) {
  try {
    const { assignmentID } = req.params;

    // Get authenticated user
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return resp.status(401).send({ error: 'Unauthorized' });
    }

    const session = getSession(token);
    if (!session) {
      return resp.status(401).send({ error: 'Invalid session' });
    }

    const submission = await getSubmission(session.id, parseInt(assignmentID));

    if (!submission) {
      return resp.status(404).send({ error: 'No submission found' });
    }

    return resp.send(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return resp.status(500).send({ error: 'Failed to fetch submission' });
  }
}

/**
 * Get all submissions for an assignment (with student details)
 */
export async function getAssignmentSubmissionsController(
  req: FastifyRequest<{ Params: { assignmentID: string } }>,
  resp: FastifyReply
) {
  try {
    const { assignmentID } = req.params;

    const submissions = await getSubmissionsByAssignment(parseInt(assignmentID));

    // Fetch student info for each submission
    const submissionsWithStudents = await Promise.all(
      submissions.map(async (submission) => {
        const student = await User.findByPk(submission.studentID, {
          attributes: ['id', 'name', 'email'],
        });
        return {
          ...submission,
          student: student ? {
            id: student.id,
            name: student.name,
            email: student.email,
          } : null,
        };
      })
    );

    return resp.send(submissionsWithStudents);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return resp.status(500).send({ error: 'Failed to fetch submissions' });
  }
}

