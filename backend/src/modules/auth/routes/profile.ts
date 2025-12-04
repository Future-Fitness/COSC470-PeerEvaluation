import { FastifyInstance } from 'fastify';
import models from '../../../util/database';

const User = models.User;

export default function (app: FastifyInstance) {
  // Get current user's profile
  app.get('/profile', async (req, resp) => {
    try {
      const token = req.headers.authorization?.split('Bearer ')[1];
      if (!token) {
        resp.status(401).send({ error: 'No token provided' });
        return;
      }

      // @ts-expect-error session exists on app
      const session = app.session[token];
      if (!session) {
        resp.status(401).send({ error: 'Invalid session' });
        return;
      }

      const userId = session.id;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'is_teacher']
      });

      if (!user) {
        resp.status(404).send({ error: 'User not found' });
        return;
      }

      resp.send({
        id: user.id,
        name: user.name,
        email: user.email,
        isTeacher: user.is_teacher
      });
    } catch (error) {
      console.error('Profile error:', error);
      resp.status(500).send({ error: 'Internal server error' });
    }
  });

  // Get any user's profile by ID (for viewing other users)
  app.get('/profile/:id', async (req, resp) => {
    try {
      // @ts-expect-error params exists
      const userId = req.params.id;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'is_teacher']
      });

      if (!user) {
        resp.status(404).send({ error: 'User not found' });
        return;
      }

      resp.send({
        id: user.id,
        name: user.name,
        email: user.email,
        isTeacher: user.is_teacher
      });
    } catch (error) {
      console.error('Profile error:', error);
      resp.status(500).send({ error: 'Internal server error' });
    }
  });
}
