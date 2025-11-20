import { useEffect, useState, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import RubricCreator from "../components/RubricCreator";
import RubricDisplay from "../components/RubricDisplay";
import TabNavigation from "../components/TabNavigation";
import { isTeacher } from "../util/login";

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
    <>
      <div className="flex flex-row justify-between items-center p-3">
        <h2 className="text-2xl font-bold">Assignment {id}</h2>
      </div>

      <TabNavigation
        tabs={[
          {
            label: "Home",
            path: `/assignments/${id}`,
          },
          {
            label: "Group",
            path: `/assignments/${id}/group`,
          }
        ]}
      />

      <div className='my-5 mx-3'>
        <RubricDisplay rubricId={Number(id)} onCriterionSelect={handleCriterionSelect} grades={review} />
      </div>
      {
        isTeacher() &&
          <div className='my-5 mx-3'>
            <RubricCreator id={Number(id)}/>
          </div>
      }

{
      !isTeacher() && <div className='my-5 mx-3 p-5 bg-white rounded-lg shadow-md'>
        <h3 className="text-xl font-bold mb-3">Select a group member to review</h3>
          {stuGroup.map((stus) => {
                return (
                  <div key={stus.userID} className="flex items-center gap-2 my-2">
                    <input type='radio' id={stus.userID.toString()} value={stus.userID} name='groupMembers' onChange={handleRadioChange} />
                    <label htmlFor={stus.userID.toString()}>{stus.username}</label>
                  </div>
                )
              }
            )
          }
          <button className='mt-4 bg-primary-500 text-white font-bold py-2 px-4 rounded hover:bg-primary-600' onClick={async () => {
            console.log("Submitting review with selected criteria:", selectedCriteria);
            try {
              if (revieweeID === 0) {
                alert("Please select a group member to review.");
                return;
              }
              const reviewResponse = await createReview(Number(id), stuID, revieweeID);
              const reviewData = await reviewResponse.json();
              console.log("Review response:", reviewData);
              for (const criterion of selectedCriteria) {
                await createCriterion(reviewData.id, criterion.row, criterion.column, "");
              }
              alert('Review submitted successfully');
              window.location.reload();
            } catch (error) {
              console.error('Error submitting review:', error);
            }
          }}>Submit Review</button>
      </div>}
    </>
  );
}

