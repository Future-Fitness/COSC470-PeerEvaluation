import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';

interface StudentCSVUploadProps {
  courseId: number;
  onUploadComplete: () => void;
  onClose: () => void;
}

interface UploadResult {
  addedCount: number;
  alreadyEnrolledCount: number;
  errorCount: number;
  results: {
    added: string[];
    alreadyEnrolled: string[];
    errors: { email: string; error: string }[];
  };
}

export default function StudentCSVUpload({ courseId, onUploadComplete, onClose }: StudentCSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId.toString());

    try {
      const response = await fetch('http://localhost:5008/upload_students_csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setResult(data);
      toast.success(`Added ${data.addedCount} student(s) to class`);
      
      if (data.addedCount > 0) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseComplete = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            Upload Students CSV
          </h2>
          <button
            onClick={handleCloseComplete}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">CSV Format</h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              Your CSV file should include the following columns:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-300 list-disc list-inside space-y-1">
              <li><strong>email</strong> (required) - Student's email address</li>
              <li><strong>name</strong> (optional) - Student's full name</li>
              <li><strong>id</strong> (optional) - Student ID number</li>
              <li><strong>password</strong> (optional) - Initial password (defaults to "letmein")</li>
            </ul>
            <div className="mt-3 bg-white dark:bg-gray-900 rounded p-2 text-xs font-mono">
              <div>email,name,id,password</div>
              <div>john@example.com,John Doe,12345,mypassword</div>
              <div>jane@example.com,Jane Smith,12346</div>
            </div>
          </div>

          {/* File Upload */}
          {!result && (
            <div className="space-y-4">
              <label className="block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <div className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                  ${file
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-700/50'
                  }
                `}>
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Click to upload CSV file
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        or drag and drop
                      </p>
                    </div>
                  )}
                </div>
              </label>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Students
                    </>
                  )}
                </Button>
                {file && !uploading && (
                  <Button
                    onClick={handleReset}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {result.addedCount}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-500">Added</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {result.alreadyEnrolledCount}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-500">Already Enrolled</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {result.errorCount}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-500">Errors</p>
                </div>
              </div>

              {/* Detailed Results */}
              {result.results.added.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                    Added Students ({result.results.added.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.results.added.map((email, idx) => (
                      <p key={idx} className="text-sm text-green-800 dark:text-green-300">
                        • {email}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.results.alreadyEnrolled.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Already Enrolled ({result.results.alreadyEnrolled.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.results.alreadyEnrolled.map((email, idx) => (
                      <p key={idx} className="text-sm text-blue-800 dark:text-blue-300">
                        • {email}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {result.results.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                    Errors ({result.results.errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {result.results.errors.map((error, idx) => (
                      <div key={idx} className="text-sm text-red-800 dark:text-red-300">
                        <p className="font-medium">• {error.email}</p>
                        <p className="ml-4 text-red-700 dark:text-red-400">{error.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleReset} className="flex-1">
                  Upload Another File
                </Button>
                <Button
                  onClick={handleCloseComplete}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
