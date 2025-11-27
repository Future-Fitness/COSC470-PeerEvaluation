import React, { useState, useEffect } from 'react';
import { FileText, Download, Users, Eye } from 'lucide-react';
import Button from './Button';
import Loader from './Loader';
import { getAssignmentSubmissions, SubmissionsWithUser } from '../util/api';
import { formatDate } from '../util/formatters';
import { showError } from '../util/toast';

interface SubmissionViewerProps {
  assignmentId: number;
}

const SubmissionViewer: React.FC<SubmissionViewerProps> = ({ assignmentId }) => {
  const [submissions, setSubmissions] = useState<SubmissionsWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const submissionsData = await getAssignmentSubmissions(assignmentId);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
      showError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const handleViewSubmission = (fileURL: string) => {
    window.open(fileURL, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadSubmission = (fileURL: string, studentName: string) => {
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `${studentName}_submission`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button onClick={fetchSubmissions} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            Student Submissions ({submissions.length})
          </h3>
          <Button onClick={fetchSubmissions} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-lg">No submissions yet</p>
          <p className="text-sm mt-2">Students haven't submitted their assignments yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {submissions.map((submission) => (
            <div key={submission.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {submission.student?.name?.charAt(0).toUpperCase() || 'S'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {submission.student?.name || 'Unknown Student'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {submission.student?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p>Submitted: {formatDate(submission.createdAt || new Date())}</p>
                    {submission.updatedAt && submission.updatedAt !== submission.createdAt && (
                      <p>Updated: {formatDate(submission.updatedAt)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleViewSubmission(submission.path)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                  <Button
                    onClick={() => handleDownloadSubmission(submission.path, submission.student?.name || 'student')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionViewer;