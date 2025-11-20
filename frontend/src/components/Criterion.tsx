import { useState } from 'react';

//Component for a single row of the criteria table
interface props {
    question: string;
    scoreMax: number;
    hasScore: boolean;
    onCriterionSelect: (row: number, column: number) => void;
    questionIndex: number;
    grade: number;
}

export default function Criterion(props: props) {
    const [clickedCell, setClickedCell] = useState<number | null>(null);

    const handleCellClick = (columnIndex: number) => {
        const column = columnIndex + 1;

        // Toggle selection: if same cell is clicked again, deselect it
        if (clickedCell === column) {
            setClickedCell(null);
            // Inform parent component about deselection
            props.onCriterionSelect(props.questionIndex, column);
        } else {
            setClickedCell(column);
            // Inform parent component about new selection
            props.onCriterionSelect(props.questionIndex, column);
        }
    }

    return (
        <tr className='h-[100px]'>
            <th className='bg-gray-200 dark:bg-gray-700 text-center p-2 text-[15px] font-bold text-gray-900 dark:text-gray-100 w-1/2 border border-gray-300 dark:border-gray-600'>{props.question}</th>
            {props.hasScore ? (
                Array.from({ length: props.scoreMax }, (_, i) => {
                    const cellValue = i + 1;
                    const isReviewed = cellValue === props.grade;
                    const isClicked = clickedCell === cellValue;
                    const cellClasses = `grow text-center p-2 box-border border border-gray-300 dark:border-gray-600 cursor-pointer min-w-[40px] ${isReviewed ? 'bg-green-300 dark:bg-green-700' : ''} ${isClicked ? 'bg-yellow-300 dark:bg-yellow-700' : ''}`;
                    return (
                        <td
                            key={i}
                            onClick={() => handleCellClick(i)}
                            className={cellClasses}
                        >
                            {cellValue}
                        </td>
                    );
                })
            ) : (
                <td className='border border-gray-300 dark:border-gray-600'>
                    <textarea className='w-full h-full min-h-[80px] resize-y box-border m-0 p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary-500' placeholder='Comment here'/>
                </td>
            )}
        </tr>
    )
}
