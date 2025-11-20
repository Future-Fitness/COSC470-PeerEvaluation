import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Download } from 'lucide-react';
import Button from './Button';
import Loader from './Loader';
import { uploadSubmission, getMySubmission, Submission } from '../util/api';
import { formatBytes } from '../util/formatters';
import { showSuccess, showError } from '../util/toast';

interface SubmissionUploadProps {
  assignmentId: number;
}

const SubmissionUpload: React.FC<SubmissionUploadProps> = ({ assignmentId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMySubmission = async () => {
    setLoading(true);
    setError(null);
    try {
      const submission = await getMySubmission(assignmentId);
      setExistingSubmission(submission);
    } catch (err) {
      console.error('Error fetching my submission:', err);
      setError('Failed to load your submission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubmission();
  }, [assignmentId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await uploadSubmission(assignmentId, selectedFile);
      showSuccess('File uploaded successfully!');
      setSelectedFile(null); // Clear selected file after upload
      fetchMySubmission(); // Refresh existing submission status
    } catch (err: any) {
      console.error('Error uploading file:', err);
      const errorMsg = err.message || 'Failed to upload file.';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <Loader />; // Inline loader
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {existingSubmission ? 'Update Your Submission' : 'Submit Your Assignment'}
      </h3>

      {existingSubmission && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-300 font-medium">
              Submitted: <a href={existingSubmission.fileURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                View Submission
              </a>
            </span>
          </div>
          <a href={existingSubmission.fileURL} target="_blank" rel="noopener noreferrer" title="Download Submission">
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300" />
          </a>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-300 text-sm">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
        <UploadCloud className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-3" />
        <p className="text-gray-600 dark:text-gray-400 mb-2 text-center">
          Drag & drop your file here, or click to select
        </p>
        <input
          type="file"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />
        <label 
          htmlFor="file-upload" 
          className="cursor-pointer inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
        >
          Select File
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-between text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <span>{selectedFile.name} ({formatBytes(selectedFile.size)})</span>
          </div>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubmissionUpload;
