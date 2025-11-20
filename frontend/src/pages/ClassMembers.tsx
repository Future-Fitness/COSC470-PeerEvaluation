import { useParams } from "react-router-dom";
import TabNavigation from "../components/TabNavigation";
import { useEffect, useState } from "react";
import Button from "../components/Button";
import { importCSV } from "../util/csv";
import { listCourseMembers, getClassName } from "../util/api";
import { isTeacher } from "../util/login";

interface Member {
  id: number;
  name: string;
}

export default function ClassMembers() {
  const { id } = useParams()
  const [members, setMembers] = useState<Member[]>([])
  const [className, setClassName] = useState<string | null>(null);

  useEffect(() => {
    ;(async () => {
      const members = await listCourseMembers(id as string)
      const classData = await getClassName(String(id));
      setMembers(members)
      setClassName(classData.className);
    })()
  }, [id])  

  return (
    <>
      <div className="flex flex-row justify-between items-center p-3">
        <div className="flex flex-row justify-between items-center p-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{className}</h2>
        </div>

        <div className="ClassHeaderRight">
          {isTeacher() ? (
            <Button onClick={() => importCSV(id as string)}>Add Students via CSV</Button>
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

      <div className="flex flex-col items-center justify-start w-full h-full">
        {
          members.map(member => {
            return (
              <div key={member.id} className="w-4/5 p-[10px] m-3 border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100">
                {member.name} ({member.id})
              </div>
            )
          })
        }
      </div>
    </>
  );
}
