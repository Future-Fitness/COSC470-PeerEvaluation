import { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import RubricCreator from "../components/RubricCreator";
import RubricDisplay from "../components/RubricDisplay";
import TabNavigation from "../components/TabNavigation";
import { isTeacher } from "../util/login";
import { Home, Users } from 'lucide-react'; // Import Lucide React icons
import { showSuccess, showError } from '../util/toast';

import {
  listStuGroup,
  getUserId,
  createReview,
  createCriterion,
  getReview
} from "../util/api";

interface StudentGroups {
  userID: number;
  username: string;
}

interface SelectedCriterion {
  row: number;
  column: number;
}

export default function Assignment() {
  const { id } = useParams();
  const [stuGroup, setStuGroup] = useState<StudentGroups[]>([]);
  const [revieweeID, setRevieweeID] = useState<number>(0);
  const [stuID, setStuID] = useState<number>(0);
  const [selectedCriteria, setSelectedCriteria] = useState<SelectedCriterion[]>([]);
  const [review, setReview] = useState<number[]>([]);

  useEffect(() => {
      (async () => {
        const stuID = await getUserId();
      setStuID(stuID);
      const stus = await listStuGroup(Number(id), stuID);
      setStuGroup(stus);
        try {
          if (revieweeID === 0) return;
          const reviewResponse = await getReview(Number(id), stuID, revieweeID);
          const reviewData = await reviewResponse.json();
          setReview(reviewData.grades);
          console.log("Review data:", reviewData);
        } catch (error) {
          console.error('Error fetching review:', error);
        }
      })();
  }, [revieweeID, id, stuID]);

  const handleCriterionSelect = (row: number, column: number) => {
    const existingIndex = selectedCriteria.findIndex(
      criterion => criterion.row === row && criterion.column === column
    );

    if (existingIndex >= 0) {
      setSelectedCriteria(prev =>
        prev.filter((_, index) => index !== existingIndex)
      );
    } else {
      setSelectedCriteria(prev => {
        const filteredCriteria = prev.filter(criterion => criterion.row !== row);
        return [...filteredCriteria, { row, column }];
      });
    }
  };

  function handleRadioChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedID = Number(event.target.value);
    setRevieweeID(selectedID);
    console.log(`Selected group member ID: ${selectedID}`);
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
            <Home className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Assignment {id} Rubric
          </h1>
        
          <TabNavigation
            tabs={[
              {
                label: "Home",
                path: `/assignments/${id}`,
              },
              {
                label: "Group",
                path: `/assignments/${id}/group`,
                icon: <Users className="w-4 h-4" />,
              }
            ]}
          />

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Rubric Details</h2>
          <RubricDisplay rubricId={Number(id)} onCriterionSelect={handleCriterionSelect} grades={review} />
        </div>
        {
          isTeacher() &&
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Rubric Creator</h2>
            <RubricCreator id={Number(id)}/>
          </div>
        }

      !isTeacher() && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-inner">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Select a group member to review</h3>
          <div className="space-y-3 mb-4">
            {stuGroup.map((stus) => (
              <div key={stus.userID} className="flex items-center">
                <input
                  type="radio"
                  id={`reviewee-${stus.userID}`}
                  value={stus.userID}
                  name="groupMembers"
                  onChange={handleRadioChange}
                  className="form-radio h-4 w-4 text-primary-600 dark:text-primary-400 transition duration-150 ease-in-out"
                />
                <label htmlFor={`reviewee-${stus.userID}`} className="ml-2 text-gray-900 dark:text-gray-100 cursor-pointer">
                  {stus.username}
                </label>
              </div>
            ))}
          </div>
          <Button onClick={async () => {
            console.log("Submitting review with selected criteria:", selectedCriteria);
            try {
              if (revieweeID === 0) {
                showError("Please select a group member to review.");
                return;
              }
              const reviewResponse = await createReview(Number(id), stuID, revieweeID);
              const reviewData = await reviewResponse.json();
              console.log("Review response:", reviewData);
              for (const criterion of selectedCriteria) {
                await createCriterion(reviewData.id, criterion.row, criterion.column, "");
              }
              showSuccess('Review submitted successfully');
              window.location.reload();
            } catch (error) {
              console.error('Error submitting review:', error);
              showError('Error submitting review');
            }
          }}>Submit Review</Button>
        </div>
      )}
      </div>
    </div>

