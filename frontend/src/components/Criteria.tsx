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
            <table className='text-center w-full max-w-[700px] border-collapse border border-black'>
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
            {props.canComment &&
            <textarea className="w-full h-full max-w-[700px] mt-2 min-h-[80px] resize-y box-border m-0 p-1 border border-[#ddd] rounded bg-slate-50 text-slate-900 font-sans text-base" />}
        </div>
    )
}