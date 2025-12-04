import { FastifyInstance } from 'fastify';
import createRubric from './create_rubric';
import getRubric from './get_rubric';
import criteria from './criteria';
import createCriteria from './create_criteria';
import createCriterion from './create_criterion';

export default function registerRubricRoutes(app: FastifyInstance) {
  createRubric(app);
  getRubric(app);
  criteria(app);
  createCriteria(app);
  createCriterion(app);
}
