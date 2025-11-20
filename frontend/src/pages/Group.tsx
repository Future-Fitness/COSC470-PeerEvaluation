import { useEffect, useState } from "react";
import {
  createGroup,
  getNextGroupID,
  getUserId,
  listCourseMembers,
  listGroupMembers,
  listGroups,
  listStuGroup,
  listUnassignedGroups,
  saveGroups,
  deleteGroup,
} from "../util/api";
import { useParams } from "react-router-dom";
import TabNavigation from "../components/TabNavigation";
import { isTeacher } from "../util/login";
import Textbox from "../components/Textbox";
import { showSuccess, showError } from "../util/toast";

function fisherYates<T>(array: T[]): T[] {
  let m = array.length, t, i;

  while (m) {
    i = Math.floor(Math.random() * m--);

    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

export default function Group() {
  const { id } = useParams();
  const [classMembers, setclassMembers] = useState<Member[]>([]);
  const [stuGroup, setStuGroup] = useState<StudentGroups[]>([]);
  const [groups, setGroups] = useState<CourseGroup[]>([]);
  const [groupTable, setGroupTable] = useState<GroupTable>({});
  const [selectedGroup, setSelectedGroup] = useState<number>(-1);
  const [memberTable, setMemberTable] = useState<GroupTable>({});
  const [groupName, setGroupName] = useState('');

  const nameFromId = (id: number) => {
    return classMembers.find((mem) => mem.id === id)?.name || 'N/A';
  };

  const randomize = () => {
    // remove every member from every group, save them
    const members = []

    for (const group of Object.values(groupTable)) {
      for (const member of group) {
        const n = { ...member }
        n.groupID = -1

        members.push(n)
      }
    }

    // Also grab the members from the unassigned table
    if (memberTable[-1]) {
      for (const member of memberTable[-1]) {
        const n = { ...member }
        n.groupID = -1

        members.push(n)
      }
    }

    const membersPerGroup = members.length / Object.keys(groupTable).length
    const gIds = Object.keys(groupTable)
    // Shuffle the array, then sequentially add them to groups
    const shuffled = fisherYates(members)
    const newTable: GroupTable = {}

    let i = 0
    for (const group of gIds) {
      for (let j = 0; j < membersPerGroup; j++) {
        const g = Number(group)
        const member = shuffled[i]
        i++

        // This will make a false entry if the amount of total people is uneven
        if (!member) break

        const n = { ...member }
        n.groupID = Number(group)

        newTable[g] = newTable[g] || []
        newTable[g].push(n)
      }
    }

    setGroupTable(newTable)
    setMemberTable({})
  }

  useEffect(() => {
    (async () => {
      const classMembers = await listCourseMembers(String(id));
      setclassMembers(classMembers);
      const groups = await listGroups(Number(id));
      setGroups(groups);
      const ua = await listUnassignedGroups(Number(id));
      const stuId = await getUserId();
      const stus = await listStuGroup(Number(id), stuId);
      setStuGroup(stus);

      const groupMembers: {
        [key: number]: GroupTableValue[];
      } = {};
      for (const g of groups) {
        const members = await listGroupMembers(Number(id), g.id);
        groupMembers[g.id] = members;
      }

      const grLocal: GroupTable = {};
      //build a table of group names and students
      for (const gr of groups) {
        grLocal[gr.id] = [];
        for (const stu of groupMembers[gr.id]) {
          if (stu.groupID === gr.id) {
            grLocal[gr.id].push(stu);
          }
        }
      }
      setGroupTable(grLocal);

      //build a table for unassigned students
      const memLocal: GroupTable = {};
      memLocal[-1] = [];
      for (const stu of ua) {
        memLocal[-1].push(stu);
      }
      setMemberTable(memLocal);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-row justify-between items-center p-3">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assignment {id}</h2>
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

      <div className="p-4">
        {isTeacher() ? (
          <>
            <div className="flex flex-row gap-6 mb-6">
              <table className="border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <thead>
                  <tr>
                    <th className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 text-left font-semibold">Unassigned</th>
                  </tr>
                </thead>
                <tbody>
                  {memberTable[-1]
                    ? memberTable[-1].map((ua, index) => {
                        return (
                          <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                            <td className="p-3 flex items-center justify-between">
                              <span className="text-gray-900 dark:text-gray-100">{nameFromId(ua.userID)}</span>
                              <button
                                className="ml-3 px-3 py-1 bg-primary-500 dark:bg-primary-600 text-white rounded hover:brightness-110 transition-all text-sm"
                                onClick={() => {
                                  const localMember = { ...memberTable };
                                  const localGroup = { ...groupTable };
                                  const memObj = localMember[-1].find(
                                    (mem) => ua.userID == mem.userID
                                  );

                                  if (memObj == undefined || selectedGroup == -1)
                                    return;

                                  localMember[-1] = localMember[-1].filter(
                                    (g) => memObj?.userID != g.userID
                                  );
                                  memObj.groupID = selectedGroup;

                                  if (memObj)
                                    localGroup[selectedGroup].push(memObj);
                                  else console.log("no unassigned users");

                                  setMemberTable(localMember);
                                  setGroupTable(localGroup);
                                }}
                              >
                                Move
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    : null}
                </tbody>
              </table>

              <table className="border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <thead>
                  <tr>
                    <th className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 text-left font-semibold">Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupTable).map((gId) => {
                    return (
                      <tr key={gId} className="border-t border-gray-200 dark:border-gray-700">
                        <td className="p-0">
                          <div
                            className={`flex items-center p-3 cursor-pointer transition-colors ${
                              Number(gId) == selectedGroup
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                            }`}
                            onClick={() => setSelectedGroup(Number(gId))}
                          >
                            <img src="/icons/arrow.svg" alt="arrow" className={`w-4 h-4 mr-2 transition-transform ${Number(gId) == selectedGroup ? 'rotate-90' : ''} dark:invert`} />
                            <span className="font-medium">{groups.find((gr) => gr.id === Number(gId))?.name}</span>
                          </div>

                          {selectedGroup !== -1 && selectedGroup == Number(gId) && (
                            <div className="bg-gray-50 dark:bg-gray-700/50">
                              {groupTable[selectedGroup].map((stu, index) => (
                                <div key={index} className="flex items-center justify-between p-3 pl-8 border-t border-gray-200 dark:border-gray-600">
                                  <span className="text-gray-800 dark:text-gray-200">{nameFromId(stu.userID)}</span>
                                  <button
                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-all text-sm"
                                    onClick={() => {
                                      const localMember = { ...memberTable };
                                      const localGroup = { ...groupTable };
                                      const memObj = localGroup[selectedGroup].find((mem) => stu.userID == mem.userID);

                                      if (memObj == undefined) return;

                                      localGroup[selectedGroup] = localGroup[selectedGroup].filter((g) => memObj?.userID != g.userID);
                                      memObj.groupID = -1;

                                      if (memObj) localMember[-1].push(memObj);
                                      else console.log("shouldn't happen?");

                                      setMemberTable(localMember);
                                      setGroupTable(localGroup);
                                    }}
                                  >
                                    Move
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded font-medium hover:brightness-110 transition-all"
                onClick={async () => {
                  try {
                    const groupMems = Object.values(groupTable);
                    const uaMems = Object.values(memberTable);
                    
                    const promises = [];
                    for (const group of groupMems) {
                      for (const mem of group) {
                        promises.push(saveGroups(mem.groupID, mem.userID, mem.assignmentID));
                      }
                    }
                    for (const group of uaMems) {
                      for (const mem of group) {
                        promises.push(saveGroups(mem.groupID, mem.userID, mem.assignmentID));
                      }
                    }
                    
                    await Promise.all(promises);
                    showSuccess("Changes saved successfully!");
                  } catch (error) {
                    console.error("Error saving changes:", error);
                    showError("Error saving changes");
                  }
                }}
              >
                Confirm Changes
              </button>

              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded font-medium hover:brightness-110 transition-all"
                onClick={randomize}
              >
                Randomize
              </button>

              <button
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded font-medium hover:brightness-110 transition-all"
                onClick={async () => {
                  if (selectedGroup == -1) {
                    showError("Please select a group to delete");
                    return;
                  }
                  if (!confirm("Are you sure you want to delete this group?")) {
                    return;
                  }
                  try {
                    await deleteGroup(selectedGroup);
                    const localGroup = { ...groupTable }
                    delete localGroup[selectedGroup];
                    setGroupTable(localGroup);
                    setSelectedGroup(-1);
                    showSuccess("Group deleted successfully!");
                  } catch (error) {
                    console.error("Error deleting group:", error);
                    showError("Error deleting group");
                  }
                }}
              >
                Delete Selected Group
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 bg-primary-500 dark:bg-primary-600 text-white rounded font-medium hover:brightness-110 transition-all"
                onClick={async () => {
                  if (!groupName.trim()) {
                    showError("Please enter a group name");
                    return;
                  }
                  try {
                    const nextGidResp = await getNextGroupID(Number(id));
                    const nextGid = nextGidResp.nextGroupID;
                    await createGroup(Number(id), groupName, nextGid);
                    showSuccess("Group created successfully!");
                    // Refresh the page to show the new group
                    window.location.reload();
                  } catch (error) {
                    console.error("Error creating group:", error);
                    showError("Failed to create group");
                  }
                }}
              >
                Create New Group
              </button>
              <Textbox
                placeholder="Group name"
                onInput={setGroupName}
                className="w-48"
              />
            </div>
          </>
        ) : (
          <div>
            <table className="border-collapse bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <thead>
                <tr>
                  <th className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-3 text-left font-semibold">My group</th>
                </tr>
              </thead>
              <tbody>
                {stuGroup.map((stus, index) => {
                  return (
                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="p-3 text-gray-900 dark:text-gray-100">{stus.userID}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
