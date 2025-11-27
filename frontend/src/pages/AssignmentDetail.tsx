import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SubmissionUpload from '../components/SubmissionUpload';
import SubmissionViewer from '../components/SubmissionViewer';
import { 
  getAssignmentById, 
  Assignment, 
  getMyProfile, 
  UserProfile, 
  getClassName,
  listCourseMembers,
  listUnassignedGroups,
  listGroupMembers,
  listGroups,
  createGroup,
  deleteGroup,
  saveGroups,
  initializeAssignmentGroups,
  getNextGroupID
} from '../util/api';
import { BookOpen, Loader2, ArrowLeft, Users, FileText, BookMarked, Home, GitBranch, Plus, Trash2, UserPlus, UserMinus, Shuffle, RefreshCw } from 'lucide-react';
import AssignmentRubric from './AssignmentRubric';
import { showSuccess, showError } from '../util/toast';
import { showConfirm } from '../util/confirm';
import { isTeacher } from '../util/login';

type TabType = 'home' | 'groups' | 'rubric';

export default function AssignmentDetail() {
  const { id } = useParams();
  const assignmentId = Number(id);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [className, setClassName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  // Group management state
  const [classMembers, setClassMembers] = useState<any[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<{[key: number]: any[]}>({});
  const [selectedGroup, setSelectedGroup] = useState<number>(-1);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);

  // Group management functions
  const refreshGroupData = async () => {
    if (!assignment?.courseID) return;
    
    setGroupLoading(true);
    try {
      // Get all data in parallel for better performance
      const [membersResp, unassignedResp, groupsResp] = await Promise.all([
        listCourseMembers(String(assignment.courseID)),
        listUnassignedGroups(assignmentId),
        listGroups(assignmentId)
      ]);
      
      setClassMembers(membersResp);
      setUnassignedStudents(unassignedResp);
      setGroups([{ id: -1, name: 'Unassigned' }, ...groupsResp]);
      
      // Get group members for each group
      const memberData: {[key: number]: any[]} = {};
      for (const group of groupsResp) {
        try {
          const members = await listGroupMembers(assignmentId, group.id);
          memberData[group.id] = members;
        } catch (err) {
          memberData[group.id] = []; // Set empty array on error
        }
      }
      setGroupMembers(memberData);
      
    } catch (err) {
      showError('Failed to load group data');
    } finally {
      setGroupLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      showError('Please enter a group name');
      return;
    }
    
    setGroupLoading(true);
    try {
      const nextId = await getNextGroupID(assignmentId);
      await createGroup(assignmentId, newGroupName.trim(), nextId.nextGroupID);
      setNewGroupName('');
      showSuccess('Group created successfully!');
      await refreshGroupData();
    } catch (err) {
      showError('Failed to create group');
    } finally {
      setGroupLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Group',
      message: `Delete "${groupName}"? All members will be moved to unassigned.`,
    });
    
    if (confirmed) {
      setGroupLoading(true);
      try {
        await deleteGroup(groupId);
        showSuccess(`"${groupName}" deleted successfully!`);
        if (selectedGroup === groupId) {
          setSelectedGroup(-1);
        }
        await refreshGroupData();
      } catch (err) {
        showError('Failed to delete group');
      } finally {
        setGroupLoading(false);
      }
    }
  };

  const handleAssignToGroup = async (studentId: number, groupId: number) => {
    try {
      await saveGroups(groupId, studentId, assignmentId);
      
      // Update state locally instead of full refresh
      const student = unassignedStudents.find(s => s.id === studentId);
      if (student) {
        // Remove from unassigned
        setUnassignedStudents(prev => prev.filter(s => s.id !== studentId));
        // Add to target group
        setGroupMembers(prev => ({
          ...prev,
          [groupId]: [...(prev[groupId] || []), { ...student, groupID: groupId }]
        }));
      }
      
      showSuccess('Student assigned successfully!');
    } catch (err) {
      showError('Failed to assign student');
    }
  };

  const handleRemoveFromGroup = async (studentId: number, groupId: number) => {
    try {
      await saveGroups(-1, studentId, assignmentId);
      
      // Update state locally instead of full refresh
      const student = groupMembers[groupId]?.find(s => s.id === studentId);
      if (student) {
        // Remove from group
        setGroupMembers(prev => ({
          ...prev,
          [groupId]: prev[groupId]?.filter(s => s.id !== studentId) || []
        }));
        // Add to unassigned
        setUnassignedStudents(prev => [...prev, { ...student, groupID: -1 }]);
      }
      
      showSuccess('Student removed successfully!');
    } catch (err) {
      showError('Failed to remove student');
    }
  };

  const handleInitializeGroups = async () => {
    const confirmed = await showConfirm({
      title: 'Initialize Groups',
      message: 'This will set up all enrolled students for group assignment. Continue?',
    });
    
    if (confirmed) {
      setGroupLoading(true);
      try {
        await initializeAssignmentGroups(assignmentId);
        showSuccess('Students initialized for group assignment!');
        await refreshGroupData();
      } catch (err) {
        showError('Failed to initialize groups');
      } finally {
        setGroupLoading(false);
      }
    }
  };

  const handleRandomizeGroups = async () => {
    if (unassignedStudents.length === 0) {
      showError('No unassigned students to randomize');
      return;
    }
    
    const availableGroups = groups.filter(g => g.id !== -1);
    if (availableGroups.length === 0) {
      showError('Create some groups first');
      return;
    }
    
    const confirmed = await showConfirm({
      title: 'Randomize Groups',
      message: `Randomly assign ${unassignedStudents.length} students to ${availableGroups.length} groups?`,
    });
    
    if (confirmed) {
      setGroupLoading(true);
      try {
        // Assign students in round-robin fashion
        for (let i = 0; i < unassignedStudents.length; i++) {
          const student = unassignedStudents[i];
          const group = availableGroups[i % availableGroups.length];
          await saveGroups(group.id, student.id, assignmentId);
        }
        showSuccess('Students randomized successfully!');
        await refreshGroupData();
      } catch (err) {
        showError('Failed to randomize students');
      } finally {
        setGroupLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [assignmentResp, userProfileResp] = await Promise.all([
          getAssignmentById(assignmentId),
          getMyProfile(),
        ]);
        setAssignment(assignmentResp);
        setCurrentUser(userProfileResp);
        
        // Fetch class name if courseID is available
        if (assignmentResp.courseID) {
          try {
            const classData = await getClassName(String(assignmentResp.courseID));
            setClassName(classData.className);
          } catch (err) {
            console.error("Failed to fetch class name:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load assignment details or user profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchData();
    } else {
      setError("Assignment ID not provided.");
      setLoading(false);
    }
  }, [assignmentId]);

  // Load group data when switching to groups tab
  useEffect(() => {
    if (activeTab === 'groups' && assignment?.courseID) {
      refreshGroupData();
    }
  }, [activeTab, assignment?.courseID]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 dark:text-primary-400 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          {assignment?.courseID && (
            <Link
              to={`/classes/${assignment.courseID}/home`}
              className="mt-4 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Class
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Assignment not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Link */}
          {assignment.courseID && (
            <Link
              to={`/classes/${assignment.courseID}/home`}
              className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {className || 'Class'}
            </Link>
          )}
          
          {/* Title Section */}
          <div className="flex items-start gap-4">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {assignment.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                {className && (
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-4 h-4" />
                    <span>{className}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Assignment ID: {assignment.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-1 px-6">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'home'
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'groups'
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Groups
            </button>
            <button
              onClick={() => setActiveTab('rubric')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-all border-b-2 ${
                activeTab === 'rubric'
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              Rubric
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'home' && (
          <>
            {/* Assignment Details Card */}
            {assignment.rubric && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Assignment Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {assignment.rubric}
                </p>
              </div>
            )}

            {/* Submission Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              {currentUser && !currentUser.isTeacher ? (
                // Student View
                <>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    Your Submission
                  </h2>
                  <SubmissionUpload assignmentId={assignmentId} />
                </>
              ) : (
                // Teacher View
                <SubmissionViewer assignmentId={assignmentId} />
              )}
            </div>
          </>
        )}

        {activeTab === 'groups' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <GitBranch className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Group Management
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={refreshGroupData}
                  disabled={groupLoading}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${groupLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {isTeacher() && (
                  <button
                    onClick={handleInitializeGroups}
                    disabled={groupLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    Initialize Groups
                  </button>
                )}
              </div>
            </div>

            {groupLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading groups...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Groups */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Groups</h3>
                    {isTeacher() && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="Group name"
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handleCreateGroup}
                          disabled={!newGroupName.trim() || groupLoading}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {groups.length === 1 && groups[0].id === -1 && isTeacher() && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <p>No groups created yet.</p>
                        <p className="text-sm mt-1">Create your first group using the form above.</p>
                      </div>
                    )}
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedGroup === group.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedGroup(group.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {group.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {groupMembers[group.id]?.length || 0} members
                            </p>
                          </div>
                          {isTeacher() && group.id !== -1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group.id, group.name);
                              }}
                              className="text-red-600 hover:text-red-700 transition-colors"
                              title={`Delete ${group.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Group Members */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedGroup === -1 ? 'Unassigned Students' : 
                       groups.find(g => g.id === selectedGroup)?.name || 'Group Members'}
                    </h3>
                    {isTeacher() && unassignedStudents.length > 0 && (
                      <button
                        onClick={handleRandomizeGroups}
                        disabled={groupLoading}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <Shuffle className="w-3 h-3" />
                        Randomize
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedGroup === -1 && unassignedStudents.length === 0 && (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        {isTeacher() ? (
                          <>
                            <p>No unassigned students found.</p>
                            <p className="text-sm mt-1">Click "Initialize Groups" to set up students for this assignment.</p>
                          </>
                        ) : (
                          <p>No unassigned students.</p>
                        )}
                      </div>
                    )}
                    {(selectedGroup === -1 ? unassignedStudents : (groupMembers[selectedGroup] || [])).map((member) => (
                      <div
                        key={member.id}
                        className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                          </p>
                        </div>
                        {isTeacher() && (
                          <div className="flex gap-2">
                            {selectedGroup === -1 ? (
                              groups.filter(g => g.id !== -1).map(group => (
                                <button
                                  key={group.id}
                                  onClick={() => handleAssignToGroup(member.id, group.id)}
                                  disabled={groupLoading}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                                  title={`Assign to ${group.name}`}
                                  aria-label={`Assign ${member.name} to ${group.name}`}
                                >
                                  → {group.name}
                                </button>
                              ))
                            ) : (
                              <button
                                onClick={() => handleRemoveFromGroup(member.id, selectedGroup)}
                                disabled={groupLoading}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                                title={`Remove ${member.name} from group`}
                                aria-label={`Remove ${member.name} from group`}
                              >
                                <UserMinus className="w-3 h-3" />
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(selectedGroup === -1 ? unassignedStudents : (groupMembers[selectedGroup] || [])).length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {selectedGroup === -1 ? 'All students are assigned to groups' : 'No members in this group'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rubric' && (
          <AssignmentRubric />
        )}
      </div>
    </div>
  );
}