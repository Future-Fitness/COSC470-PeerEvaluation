import AssignmentCard from "../components/AssignmentCard";
import Button from "../components/Button";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { listAssignments, getClassName, createAssignment } from "../util/api";
import TabNavigation from "../components/TabNavigation";
import { importCSV } from "../util/csv";
import Textbox from "../components/Textbox";
import { isTeacher } from "../util/login";

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
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-row justify-between items-center p-3">
          <div className="flex flex-row justify-between items-center p-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{className}</h2>
          </div>

        <div className="ClassHeaderRight">
          {isTeacher() ? (
            <Button onClick={() => importCSV(id as string)}>
              Add Students via CSV
            </Button>
          ) : null}
        </div>
      </div>

      <TabNavigation
        tabs={[
          {
            label: "Home",
            path: `/classes/${id}/home`,
          },
          {
            label: "Members",
            path: `/classes/${id}/members`,
          },
        ]}
      />

      <div className="block w-full h-full m-3">
        <div className="flex flex-row p-3 items-start w-full">
          <ul className="w-full list-none m-2 p-0">
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
          <div className="m-2 w-[30%] bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
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
