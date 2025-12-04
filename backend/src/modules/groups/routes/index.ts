import { FastifyInstance } from 'fastify';
import createGroup from './create_group';
import deleteGroup from './delete_group';
import listAllGroups from './list_all_groups';
import listGroupMembers from './list_group_members';
import listStuGroup from './list_stu_group';
import listUaGroups from './list_ua_groups';
import nextGroupId from './next_groupid';
import saveGroups from './save_groups';
import initializeAssignmentGroups from './initialize_assignment_groups';

export default function registerGroupRoutes(app: FastifyInstance) {
  createGroup(app);
  deleteGroup(app);
  listAllGroups(app);
  listGroupMembers(app);
  listStuGroup(app);
  listUaGroups(app);
  nextGroupId(app);
  saveGroups(app);
  initializeAssignmentGroups(app);
}
