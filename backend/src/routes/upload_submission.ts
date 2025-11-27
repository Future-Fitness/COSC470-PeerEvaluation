import { FastifyInstance } from 'fastify';
import { uploadSubmissionController } from '../controllers/submissionController';

export default function (app: FastifyInstance) {
  app.post('/upload_submission', async (req, resp) => {
    // @ts-expect-error session is added by middleware
    const getSession = (token: string) => app.session[token];
    await uploadSubmissionController(req, resp, getSession);
  });
}
