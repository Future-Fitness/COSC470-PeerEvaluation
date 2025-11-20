import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import SubmissionUpload from '../components/SubmissionUpload'; // New import
import { getAssignmentById, Assignment, getMyProfile, UserProfile } from '../util/api'; // Updated imports
import { BookOpen, Loader2 } from 'lucide-react'; // Import Loader2 icon

export default function AssignmentDetail() {
  const { id } = useParams();
  const assignmentId = Number(id);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); // New state for current user

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [assignmentResp, userProfileResp] = await Promise.all([
          getAssignmentById(assignmentId),
          getMyProfile(),
        ]);
        setAssignment(assignmentResp);
        setCurrentUser(userProfileResp);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load assignment details or user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchData();
    } else {
      setError("Assignment ID not provided.");
      setLoading(false);
    }
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 dark:text-primary-400 animate-spin" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading assignment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
          <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Assignment not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
            <BookOpen className="w-9 h-9 text-primary-600 dark:text-primary-400" />
            {assignment.name}
          </h1>
          <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-300">
            Course ID: {assignment.courseID}
          </span>
        </div>

        {currentUser && !currentUser.isTeacher ? ( // Student View
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Your Submission</h2>
            <SubmissionUpload assignmentId={assignmentId} />
          </div>
        ) : ( // Teacher View
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow-inner p-5">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Student Submissions</h2>
              <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800">
                Submissions table component will go here for teachers. (Phase 6)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}