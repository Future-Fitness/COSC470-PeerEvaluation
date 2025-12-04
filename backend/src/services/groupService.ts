import models from '../util/database';

export type GroupMemberDTO = {
  id: number;
  name: string;
  email: string;
  userID: number;
  groupID: number;
  assignmentID: number;
};

type GroupMemberWithUser = {
  userID: number;
  groupID: number;
  assignmentID: number;
  User?: {
    id: number;
    name: string;
    email: string;
  };
};

export async function listGroupMembers(assignmentID: number, groupID: number): Promise<GroupMemberDTO[]> {
  const GroupMembers = (models as unknown as { Group_Member: any }).Group_Member;
  const User = (models as unknown as { User: any }).User;

  const members: GroupMemberWithUser[] = await GroupMembers.findAll({
    where: { groupID, assignmentID },
    include: [{ model: User, attributes: ['id', 'name', 'email'], required: true }],
  });

  return members
    .map((member) => {
      if (!member.User) return null;
      return {
        id: member.User.id,
        name: member.User.name,
        email: member.User.email,
        userID: member.userID,
        groupID: member.groupID,
        assignmentID: member.assignmentID,
      } as GroupMemberDTO;
    })
    .filter(Boolean) as GroupMemberDTO[];
}

export async function listStudentGroups(userID: number): Promise<{ userID: number; groupID: number; assignmentID: number }[]> {
  const GroupMembers = (models as unknown as { Group_Member: any }).Group_Member;
  type Row = { userID: number; groupID: number; assignmentID: number };
  const rows: Row[] = await GroupMembers.findAll({ where: { userID } });
  return rows.map((r: Row) => ({ userID: r.userID, groupID: r.groupID, assignmentID: r.assignmentID }));
}

export async function listUnassignedStudents(assignmentID: number): Promise<GroupMemberDTO[]> {
  const GroupMembers = (models as unknown as { Group_Member: any }).Group_Member;
  const User = (models as unknown as { User: any }).User;
  const members: GroupMemberWithUser[] = await GroupMembers.findAll({
    where: { groupID: -1, assignmentID },
    include: [{ model: User, attributes: ['id', 'name', 'email'], required: true }],
  });
  return members
    .map((member) => {
      if (!member.User) return null;
      return {
        id: member.User.id,
        name: member.User.name,
        email: member.User.email,
        userID: member.userID,
        groupID: member.groupID,
        assignmentID: member.assignmentID,
      } as GroupMemberDTO;
    })
    .filter(Boolean) as GroupMemberDTO[];
}
