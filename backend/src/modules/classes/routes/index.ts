import { FastifyInstance } from 'fastify';
import classes from './classes';
import createClass from './create_class';
import getClassName from './get_className';
import classMembers from './class_members';

export default function registerClassRoutes(app: FastifyInstance) {
  classes(app);
  createClass(app);
  getClassName(app);
  classMembers(app);
}
