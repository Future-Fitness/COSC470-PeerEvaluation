import { useEffect, useState } from "react";
import ClassCard from "../components/ClassCard";
import { LayoutDashboard, Plus } from 'lucide-react'; // Import LayoutDashboard icon and Plus icon
import Loader from '../components/Loader'; // Import Loader component
import Modal from '../components/Modal'; // Import Modal component
import Textbox from '../components/Textbox'; // Import Textbox component
import Button from '../components/Button'; // Import Button component

import { getClasses, getMyProfile, Class, UserProfile, createClass } from "../util/api"; // Updated imports
import { isTeacher } from "../util/login"; // isTeacher is still used for localStorage check for initial render
import { showSuccess, showError } from '../util/toast';

export default function Home() {
  const [courses, setCourses] = useState<Class[]>([]); // Updated state type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Add error state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); // Add currentUser state
  const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false); // State for modal visibility
  const [newClassName, setNewClassName] = useState(''); // State for new class name
  const [isCreatingClass, setIsCreatingClass] = useState(false); // State for class creation loading

  const fetchClassesAndProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const [classesResp, userProfileResp] = await Promise.all([
        getClasses(),
        getMyProfile(),
      ]);
      setCourses(classesResp);
      setCurrentUser(userProfileResp);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndProfile();
  }, []); // Empty dependency array means this runs once on mount

  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      showError('Class name cannot be empty.');
      return;
    }
    setIsCreatingClass(true);
    try {
      await createClass(newClassName);
      showSuccess('Class created successfully!');
      setNewClassName('');
      setIsCreateClassModalOpen(false);
      fetchClassesAndProfile(); // Refresh the list of classes
    } catch (err) {
      console.error('Error creating class:', err);
      showError('Failed to create class. Please try again.');
    } finally {
      setIsCreatingClass(false);
    }
  };

  if (loading) {
    return <Loader fullScreen />;
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

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4 pb-4 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        Peer Review Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {
          courses.map((course) => {
            return (
              <ClassCard
                key={course.id}
                image="https://crc.losrios.edu//shared/img/social-1200-630/programs/general-science-social.jpg"
                name={course.name}
                subtitle={`Teacher ID: ${course.teacherID}`}
                classId={course.id} // Pass classId prop
              />
            )
          })
        }

        {currentUser?.isTeacher && ( // Conditional rendering based on currentUser
          <div
            className="flex flex-col items-center justify-center min-h-[240px] bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-md hover:-translate-y-1 active:translate-y-0"
            onClick={() => setIsCreateClassModalOpen(true)} // Open modal on click
          >
            <Plus className="w-12 h-12 text-blue-500 dark:text-blue-400 mb-3" /> {/* Lucide Plus icon */}
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Create Class</h2>
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={isCreateClassModalOpen}
        onClose={() => setIsCreateClassModalOpen(false)}
        title="Create New Class"
      >
        <div className="flex flex-col gap-4">
          <Textbox
            placeholder="Enter class name"
            value={newClassName}
            onInput={setNewClassName}
            disabled={isCreatingClass}
          />
          <Button
            onClick={handleCreateClass}
            disabled={isCreatingClass}
          >
            {isCreatingClass ? 'Creating...' : 'Create Class'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}