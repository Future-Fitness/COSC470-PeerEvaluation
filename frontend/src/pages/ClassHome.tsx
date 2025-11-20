import AssignmentCard from "../components/AssignmentCard";
import Button from "../components/Button";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { listAssignments, getClassName, createAssignment } from "../util/api";
import TabNavigation from "../components/TabNavigation";
import { importCSV } from "../util/csv";
import Textbox from "../components/Textbox";
import { isTeacher } from "../util/login";
import { Home, Users, Library, FileUp } from 'lucide-react'; // Import Lucide React icons

interface Course {
  id: number;
  name: string;
}

export default function ClassHome() {
  const { id } = useParams();
  const idNew = Number(id)
  const [assignments, setAssignments] = useState<Course[]>([]);
  const [newAssignmentName, setNewAssignmentName] = useState("");
  const [className, setClassName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const resp = await listAssignments(String(id));
      const classData = await getClassName(String(id));
      setAssignments(resp);
      setClassName(classData.className);
    })();
  }, [id]);
    
    const tryCreateAssingment = async () => {
      try {
        if (!newAssignmentName) {
          alert("Please enter an assignment name.");
          return;
        }
        const response = await createAssignment(idNew, newAssignmentName);
        
        if (!response.id) {
          throw new Error('Failed to create assignment');
        }

        alert('Assignment created successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Error creating assignment:', error);
        alert('Error creating assignment.');
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
          <div className="flex flex-row items-start w-full">
            <ul className="w-full list-none p-0">
              {assignments.map((assignment) => {
                return (
                  <li key={assignment.id}>
                    <AssignmentCard id={assignment.id}>
                      {assignment.name}
                    </AssignmentCard>
                  </li>
                );
              })}
            </ul>
          </div>

          {isTeacher() ? (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6 w-full max-w-sm">
              <span className="font-bold text-gray-900 dark:text-gray-100">New Assignment Name:</span>
              <Textbox
                placeholder="New Assignment..."
                onInput={setNewAssignmentName}
                className="flex flex-col items-center mb-3 w-full mt-2"
              />
              <Button
                onClick={() =>
                  tryCreateAssingment()
                }
              >
                Add
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    );

}
