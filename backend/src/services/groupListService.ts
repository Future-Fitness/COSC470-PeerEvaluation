import models from '../util/database';

export type GroupDTO = {
  id: number;
  name: string;
  assignmentID: number;
};

export async function listAllGroups(assignmentID: number): Promise<GroupDTO[]> {
  const CourseGroup = models.CourseGroup;
  const groups = await CourseGroup.findAll({ where: { assignmentID } });
  return groups.map((g: any) => ({ id: g.id, name: g.name, assignmentID: g.assignmentID }));
}
