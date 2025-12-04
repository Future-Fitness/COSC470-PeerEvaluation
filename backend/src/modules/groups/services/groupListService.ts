import models from '../../../util/database';

export type GroupDTO = {
  id: number;
  name: string;
  assignmentID: number;
};

export async function listAllGroups(assignmentID: number): Promise<GroupDTO[]> {
  const CourseGroup = (models as unknown as { CourseGroup: any }).CourseGroup;
  type CourseGroupRow = { id: number; name: string; assignmentID: number };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups: any[] = await CourseGroup.findAll({ where: { assignmentID } });
  return groups.map((g: CourseGroupRow) => ({ id: (g as CourseGroupRow).id, name: (g as CourseGroupRow).name, assignmentID: (g as CourseGroupRow).assignmentID }));
}
