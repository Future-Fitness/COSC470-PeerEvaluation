import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SubmissionUpload from '../components/SubmissionUpload';
import { getAssignmentById, Assignment, getMyProfile, UserProfile, getClassName } from '../util/api';
import { BookOpen, Loader2, ArrowLeft, Users, FileText, BookMarked, Home, GitBranch } from 'lucide-react';
import Group from './Group';
import AssignmentRubric from './AssignmentRubric';

type TabType = 'home' | 'groups' | 'rubric';

export default function AssignmentDetail() {
  const { id } = useParams();
  const assignmentId = Number(id);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [className, setClassName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('home');

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
        
        // Fetch class name if courseID is available
        if (assignmentResp.courseID) {
          try {
            const classData = await getClassName(String(assignmentResp.courseID));
            setClassName(classData.className);
          } catch (err) {
            console.error("Failed to fetch class name:", err);
          }
        }
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 dark:text-primary-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          {assignment?.courseID && (
            <Link
              to={`/classes/${assignment.courseID}/home`}
              className="mt-4 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Class
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Assignment not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Link */}
          {assignment.courseID && (
            <Link
              to={`/classes/${assignment.courseID}/home`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {className || 'Class'}
            </Link>
          )}
          
          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {assignment.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {className && (
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4" />
                    <span>{className}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Assignment ID: {assignment.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'home'
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'groups'
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Groups
            </button>
            <button
              onClick={() => setActiveTab('rubric')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'rubric'
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              Rubric
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'home' && (
          <>
            {/* Assignment Details Card */}
            {assignment.rubric && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Assignment Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assignment.rubric}
                </p>
              </div>
            )}

            {/* Submission Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              {currentUser && !currentUser.isTeacher ? (
                // Student View
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    Your Submission
                  </h2>
                  <SubmissionUpload assignmentId={assignmentId} />
                </>
              ) : (
                // Teacher View
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    Student Submissions
                  </h2>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                    <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      Student submissions viewer coming soon
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      This feature will allow you to view and grade all student submissions
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <Group />
        )}

        {activeTab === 'rubric' && (
          <AssignmentRubric />
        )}
      </div>
    </div>
  );
}