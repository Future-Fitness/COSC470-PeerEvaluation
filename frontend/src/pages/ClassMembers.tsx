import { useParams } from "react-router-dom";
import TabNavigation from "../components/TabNavigation";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import { getEnrolledStudents, getAvailableStudents, addStudentsToClass, removeStudentsFromClass, getClassName, type Student } from "../util/api";
import { isTeacher } from "../util/login";
import { UserPlus, UserMinus, X, Loader2, Users } from "lucide-react";

export default function ClassMembers() {
  const { id } = useParams();
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEnrolled, setSelectedEnrolled] = useState<number[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchEnrolled = async () => {
    if (!id) return;
    try {
      const students = await getEnrolledStudents(id);
      setEnrolledStudents(students);
    } catch (error) {
      console.error('Error fetching enrolled students:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [students, classData] = await Promise.all([
          getEnrolledStudents(id),
          getClassName(id)
        ]);
        setEnrolledStudents(students);
        setClassName(classData.className);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load class members' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddStudentsClick = async () => {
    if (!id) return;
    try {
      const available = await getAvailableStudents(id);
      setAvailableStudents(available);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching available students:', error);
      setMessage({ type: 'error', text: 'Failed to load available students' });
    }
  };

  const handleAddSelected = async () => {
    if (!id || selectedAvailable.length === 0) return;
    try {
      setSubmitting(true);
      const result = await addStudentsToClass(parseInt(id), selectedAvailable);
      setMessage({
        type: 'success',
        text: `Successfully added ${result.addedCount} student(s) to class`
      });
      await fetchEnrolled();
      setShowModal(false);
      setSelectedAvailable([]);
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error adding students:', error);
      setMessage({ type: 'error', text: 'Failed to add students' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSelected = async () => {
    if (!id || selectedEnrolled.length === 0) return;
    if (!confirm(`Remove ${selectedEnrolled.length} student(s) from class?`)) return;

    try {
      setSubmitting(true);
      const result = await removeStudentsFromClass(parseInt(id), selectedEnrolled);
      setMessage({
        type: 'success',
        text: `Successfully removed ${result.removedCount} student(s) from class`
      });
      await fetchEnrolled();
      setSelectedEnrolled([]);
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error removing students:', error);
      setMessage({ type: 'error', text: 'Failed to remove students' });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEnrolledStudent = (studentId: number) => {
    setSelectedEnrolled(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAvailableStudent = (studentId: number) => {
    setSelectedAvailable(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-row justify-between items-center p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{className || 'Loading...'}</h2>
        {isTeacher() && (
          <Button
            onClick={handleAddStudentsClick}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Students
          </Button>
        )}
      </div>

      <TabNavigation
        tabs={[
          { label: "Home", path: `/classes/${id}/home` },
          { label: "Members", path: `/classes/${id}/members` },
        ]}
      />

      <div className="max-w-6xl mx-auto p-6">
        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Enrolled Students Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Enrolled Students ({enrolledStudents.length})
            </h3>
            {isTeacher() && selectedEnrolled.length > 0 && (
              <Button
                onClick={handleRemoveSelected}
                disabled={submitting}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
              >
                <UserMinus className="w-4 h-4" />
                Remove Selected ({selectedEnrolled.length})
              </Button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 dark:text-primary-400" />
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No students enrolled yet</p>
              {isTeacher() && (
                <p className="text-sm mt-2">Click "Add Students" to get started</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {enrolledStudents.map(student => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {isTeacher() && (
                    <input
                      type="checkbox"
                      checked={selectedEnrolled.includes(student.id)}
                      onChange={() => toggleEnrolledStudent(student.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500">ID: {student.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Students Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Add Students to Class
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {availableStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No available students to add</p>
                  <p className="text-sm mt-2">All students are already enrolled in this class</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Available Students ({availableStudents.length})
                  </div>
                  {availableStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      onClick={() => toggleAvailableStudent(student.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAvailable.includes(student.id)}
                        onChange={() => toggleAvailableStudent(student.id)}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{student.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                      </div>
                      <div className="text-sm text-gray-400 dark:text-gray-500">ID: {student.id}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSelected}
                disabled={selectedAvailable.length === 0 || submitting}
                className="flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Add Selected ({selectedAvailable.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
