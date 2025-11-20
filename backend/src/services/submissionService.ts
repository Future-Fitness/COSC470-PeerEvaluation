import models from '../util/database';
import { uploadToCloudinary, UploadResult } from '../util/fileUpload';

const Submission = models.Submission;

export interface SubmissionData {
  id: number;
  path: string;
  studentID: number;
  assignmentID: number;
}

/**
 * Upload a submission file and create/update database record
 */
export async function createOrUpdateSubmission(
  fileStream: NodeJS.ReadableStream,
  studentID: number,
  assignmentID: number
): Promise<{ submission: SubmissionData; upload: UploadResult }> {
  // Upload to Cloudinary
  const folder = `submissions/${assignmentID}`;
  const publicId = `student_${studentID}_${Date.now()}`;
  
  const uploadResult = await uploadToCloudinary(fileStream, folder, publicId);

  // Check if submission already exists
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
      path: uploadResult.url,
    });
    submission = existingSubmission;
  } else {
    // Create new submission
    submission = await Submission.create({
      path: uploadResult.url,
      studentID,
      assignmentID,
    });
  }

  return {
    submission: {
      id: submission.id,
      path: submission.path,
      studentID: submission.studentID,
      assignmentID: submission.assignmentID,
    },
    upload: uploadResult,
  };
}

/**
 * Get a student's submission for an assignment
 */
export async function getSubmission(
  studentID: number,
  assignmentID: number
): Promise<SubmissionData | null> {
  const submission = await Submission.findOne({
    where: {
      studentID,
      assignmentID,
    },
  });

  if (!submission) {
    return null;
  }

  return {
    id: submission.id,
    path: submission.path,
    studentID: submission.studentID,
    assignmentID: submission.assignmentID,
  };
}

/**
 * Get all submissions for an assignment
 */
export async function getSubmissionsByAssignment(
  assignmentID: number
): Promise<SubmissionData[]> {
  const submissions = await Submission.findAll({
    where: {
      assignmentID,
    },
  });

  return submissions.map((sub) => ({
    id: sub.id,
    path: sub.path,
    studentID: sub.studentID,
    assignmentID: sub.assignmentID,
  }));
}
