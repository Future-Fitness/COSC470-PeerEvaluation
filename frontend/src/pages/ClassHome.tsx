import AssignmentCard from "../components/AssignmentCard";
import Button from "../components/Button";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAssignments, getClassName, createAssignment, Assignment } from "../util/api"; // Updated imports
import TabNavigation from "../components/TabNavigation";
import { importCSV } from "../util/csv";
import Textbox from "../components/Textbox";
import Textarea from "../components/Textarea"; // Import Textarea component
import Modal from "../components/Modal"; // Import Modal component
import { isTeacher } from "../util/login";
import { Home, Users, Library, FileUp, Plus } from 'lucide-react'; // Import Lucide React icons and Plus icon
import Loader from '../components/Loader'; // Import Loader component
import { showSuccess, showError } from '../util/toast';

export default function ClassHome() {
  const { id } = useParams();
  const courseId = Number(id); // Renamed idNew to courseId for clarity
  const [assignments, setAssignments] = useState<Assignment[]>([]); // Updated state type
  const [loadingAssignments, setLoadingAssignments] = useState(true); // Loading state for assignments
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null); // Error state for assignments
  const [newAssignmentName, setNewAssignmentName] = useState("");
  const [newAssignmentDescription, setNewAssignmentDescription] = useState(''); // State for assignment description
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false); // State for create assignment modal
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false); // State for assignment creation loading
  const [className, setClassName] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    setAssignmentsError(null);
    try {
      const resp = await getAssignments(courseId);
      setAssignments(resp);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setAssignmentsError("Failed to load assignments. Please try again.");
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    (async () => {
      // Fetch class name
      try {
        const classData = await getClassName(String(id));
        setClassName(classData.className);
      } catch (err) {
        console.error("Failed to fetch class name:", err);
        // Handle error for class name
      }

      // Fetch assignments
      fetchAssignments();
    })();
  }, [id, courseId]); // Dependency on id and courseId

  const tryCreateAssignment = async () => { // Renamed from tryCreateAssingment
    if (!newAssignmentName.trim()) {
      showError("Assignment name cannot be empty.");
      return;
    }
    setIsCreatingAssignment(true);
    try {
      // Assuming createAssignment API also accepts a description/rubric field
      // For now, only passing name, as per API definition from Tasks.md, rubric will be handled later
      const response = await createAssignment(courseId, newAssignmentName);
      
      if (!response.id) {
        throw new Error('Failed to create assignment');
      }

      showSuccess('Assignment created successfully!');
      setNewAssignmentName(''); // Clear input
      setNewAssignmentDescription(''); // Clear description
      setIsCreateAssignmentModalOpen(false); // Close modal
      fetchAssignments(); // Refresh the list of assignments
    } catch (error) {
      console.error('Error creating assignment:', error);
      showError('Error creating assignment.');
    } finally {
      setIsCreatingAssignment(false);
    }
  };
    
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-row justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center gap-3"> {/* Added items-center and gap-3 for icon alignment */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              <Library className="w-6 h-6 text-primary-600 dark:text-primary-400 inline-block mr-2" /> {/* Library Icon */}
              {className}
            </h2>
          </div>

          <div className="ClassHeaderRight">
            {isTeacher() ? (
              <Button onClick={() => importCSV(id as string)}>
                <FileUp className="w-4 h-4 mr-2" /> {/* FileUp Icon */}
                Add Students via CSV
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mb-4">
          <TabNavigation
            tabs={[
              {
                label: "Home",
                path: `/classes/${id}/home`,
                icon: <Home className="w-4 h-4" />,
              },
              {
                label: "Members",
                path: `/classes/${id}/members`,
                icon: <Users className="w-4 h-4" />,
              },
            ]}
          />
        </div>

        <div className="block w-full h-full px-6 mt-4">
          {isTeacher() && (
            <div className="mb-6">
              <Button onClick={() => setIsCreateAssignmentModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Assignment
              </Button>
            </div>
          )}

          {loadingAssignments ? (
            <Loader /> // Inline loader for assignments
          ) : assignmentsError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 text-center">
              <p>{assignmentsError}</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-600 dark:text-blue-400 text-center">
              <p>No assignments created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => {
                return (
                  <AssignmentCard
                    key={assignment.id}
                    id={assignment.id}
                    name={assignment.name || 'Untitled Assignment'}
                    courseID={assignment.courseID}
                    rubric={assignment.rubric}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Create Assignment Modal */}
        <Modal
          isOpen={isCreateAssignmentModalOpen}
          onClose={() => setIsCreateAssignmentModalOpen(false)}
          title="Create New Assignment"
        >
          <div className="flex flex-col gap-4">
            <Textbox
              placeholder="Assignment Name"
              value={newAssignmentName}
              onInput={setNewAssignmentName}
              disabled={isCreatingAssignment}
            />
            <Textarea
              placeholder="Assignment Description (e.g., Rubric details)"
              value={newAssignmentDescription}
              onInput={setNewAssignmentDescription}
              rows={5}
              disabled={isCreatingAssignment}
            />
            <Button
              onClick={tryCreateAssignment}
              disabled={isCreatingAssignment}
            >
              {isCreatingAssignment ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </Modal>
      </div>
    );

}
