import { Link } from 'react-router-dom';
import { FileText, Users, Calendar, ChevronRight } from 'lucide-react';

interface Props {
  id: number | string;
  name: string;
  courseID?: number;
  rubric?: string;
  createdAt?: string;
  groupCount?: number;
  submissionCount?: number;
}

export default function AssignmentCard(props: Props) {
  return (
    <Link
      to={`/assignments/${props.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 group"
    >
      <div className="p-6">
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
              <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                {props.name}
              </h3>
              {props.rubric && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {props.rubric}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Stats/Info Section */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
          {props.groupCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{props.groupCount} {props.groupCount === 1 ? 'Group' : 'Groups'}</span>
            </div>
          )}
          {props.submissionCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>{props.submissionCount} {props.submissionCount === 1 ? 'Submission' : 'Submissions'}</span>
            </div>
          )}
          {props.createdAt && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Calendar className="w-4 h-4" />
              <span>{new Date(props.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}