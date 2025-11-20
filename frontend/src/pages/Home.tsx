import { useEffect, useState } from "react";
import ClassCard from "../components/ClassCard";
import { LayoutDashboard } from 'lucide-react'; // Import LayoutDashboard icon
import Loader from '../components/Loader'; // Import Loader component

import { listClasses } from "../util/api";
import { isTeacher } from "../util/login";

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    ;(async () => {
      setLoading(true); // Set loading to true before fetching
      const resp = await listClasses()
      setCourses(resp)
      setLoading(false); // Set loading to false after fetching
    })()
  }, [])

  if (loading) {
    return <Loader fullScreen />; // Render full-screen loader when loading
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
                subtitle={"A course"}
                onclick={() => {
                  window.location.href = `/classes/${course.id}/home`
                }}
              />
            )
          })
        }

        {isTeacher() && (
          <div
            className="flex flex-col items-center justify-center min-h-[240px] bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:shadow-md hover:-translate-y-1 active:translate-y-0"
            onClick={() => window.location.href = '/classes/create'}
          >
            <svg className="w-12 h-12 text-blue-500 dark:text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">Create Class</h2>
          </div>
        )}
      </div>
    </div>
  )
}