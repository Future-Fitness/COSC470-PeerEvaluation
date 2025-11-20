import Criterion from '../components/Criterion';

interface props {
    questions: Array<string>;
    scoreMaxes: Array<number>;
    canComment: boolean;
    hasScores: Array<boolean>;
    onCriterionSelect: (row: number, column:number) => void;
    grades: number[];
}

export default function Criteria(props: props) {
    return (
        <div className="flex flex-col items-center justify-center mt-5">
            <div className="overflow-x-auto w-full max-w-[700px]"> {/* Added overflow-x-auto wrapper */}
                <table className='text-center w-full border-collapse border border-gray-300 dark:border-gray-700'>
                    <tbody>
                    {props.questions.map((question, i) => (
                        <Criterion
                            key={i}
                            question={question}
                            scoreMax={props.scoreMaxes[i]}
                            hasScore={props.hasScores[i]}
                            onCriterionSelect={props.onCriterionSelect}
                            questionIndex={i}
                            grade={props.grades[i]}
                        />
                    ))}
                    </tbody>
                </table>
            </div>
            {props.canComment &&
            <textarea className="w-full h-full max-w-[700px] mt-2 min-h-[80px] resize-y box-border m-0 p-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-sans text-base focus:outline-none focus:ring-2 focus:ring-primary-500" />}
        </div>
    )
}