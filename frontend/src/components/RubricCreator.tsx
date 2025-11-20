import { useState } from 'react';
import Button from './Button';
import { createCriteria, createRubric } from '../util/api';

interface Criterion {
    rubricID: number;
    question: string;
    scoreMax: number;
    hasScore: boolean;
}

interface RubricCreatorProps {
    onRubricCreated?: (rubricId: number) => void;
    id: number;
}

export default function RubricCreator({ onRubricCreated, id }: RubricCreatorProps) {
    const [newCriteria, setNewCriteria] = useState<Criterion[]>([{ rubricID: 0, question: '', scoreMax: 0, hasScore: true }]);
    const [canComment, setCanComment] = useState(false);

    const handleCreate = async () => {
        try {
            const rubricResponse = await createRubric(id, id, canComment);
            const newRubricID = rubricResponse.id;
            await Promise.all(newCriteria.map(({ question, scoreMax, hasScore }) => 
                createCriteria(newRubricID, question, scoreMax, canComment, hasScore)
            ));
            alert("Rubric created successfully!");
            window.location.reload();
            if (onRubricCreated) {
                onRubricCreated(newRubricID);
            }
        } catch (error) {
            console.error("Error creating criteria:", error);
        }
    };

    const handleQuestionChange = (index: number, value: string) => {
        const updatedCriteria = [...newCriteria];
        updatedCriteria[index].question = value;
        setNewCriteria(updatedCriteria);
    };

    const handleScoreMaxChange = (index: number, value: number) => {
        const updatedCriteria = [...newCriteria];
        updatedCriteria[index].scoreMax = Math.max(0, value);
        setNewCriteria(updatedCriteria);
    };

    const handleHasScoreChange = (index: number, value: boolean) => {
        const updatedCriteria = [...newCriteria];
        updatedCriteria[index].hasScore = value;
        if (!value) {
            updatedCriteria[index].scoreMax = 0;
        }
        setNewCriteria(updatedCriteria);
    };

    const handleAddNewSection = () => setNewCriteria(prev => [...prev, { rubricID: 0, question: '', scoreMax: 0, hasScore: true }]);

    const handleRemoveSection = (index: number) => setNewCriteria(prev => prev.filter((_, i) => i !== index));

    return (
        <div className="p-5 bg-gray-100 rounded-lg my-5">
            <h2 className="mb-5 text-gray-800 text-xl font-bold">Create New Criteria</h2>

            <label className="block mb-5">
                Reviewer can comment:
                <input
                    type="checkbox"
                    checked={canComment}
                    onChange={() => setCanComment(prev => !prev)}
                    className="ml-2"
                />
            </label>

            {newCriteria.map((item, index) => (
                <div key={index} className="flex gap-[10px] items-center mb-[15px] p-[10px] bg-white rounded shadow-sm">
                    <input
                        type="text"
                        value={item.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        placeholder="Enter question"
                        className="flex-1 p-2 border border-gray-300 rounded"
                    />
                    <label className="flex items-center gap-2">
                        Has score:
                        <input
                            type="checkbox"
                            checked={item.hasScore}
                            onChange={(e) => handleHasScoreChange(index, e.target.checked)}
                        />
                    </label>
                    {item.hasScore && (
                        <input
                            type="number"
                            min="0"
                            value={item.scoreMax}
                            onChange={(e) => handleScoreMaxChange(index, Number(e.target.value))}
                            placeholder="Enter score max"
                            className="w-[100px] p-2 border border-gray-300 rounded"
                        />
                    )}
                    <Button onClick={() => handleRemoveSection(index)}>Remove Criterion</Button>
                </div>
            ))}

            <div className="flex gap-[10px] mt-5">
                <Button onClick={handleAddNewSection}>Add New Criterion</Button>
                <Button onClick={handleCreate}>Create</Button>
            </div>
        </div>
    );
} 