import { FastifyInstance } from 'fastify';
import models from '../../../util/database';
import { Op } from 'sequelize';

const User = models.User;
const OTP = models.OTP;

export default function (app: FastifyInstance) {
  app.post('/verify_otp', async (req, resp) => {
    try {
      const { email, otp } = req.body as { email: string; otp: string };

      if (!email || !otp) {
        resp.status(400).send({ error: 'Email and OTP are required' });
        return;
      }

      // Find the OTP record
      const otpRecord = await OTP.findOne({
        where: {
          email,
          otp_code: otp,
          is_used: false,
          expires_at: {
            [Op.gt]: new Date()
          }
        },
        order: [['created_at', 'DESC']]
      });

      if (!otpRecord) {
        resp.status(401).send({ error: 'Invalid or expired OTP' });
        return;
      }

      // Mark OTP as used
      await OTP.update(
        { is_used: true },
        { where: { id: otpRecord.id } }
      );

      // Get user details
      const user = await User.findOne({ where: { email } });

      if (!user) {
        resp.status(404).send({ error: 'User not found' });
        return;
      }

      // Create session/token (similar to existing login)
      const token = Buffer.from(`${user.email}:${Date.now()}`).toString('base64');

      // Store session in global state (matching existing login pattern)
      // @ts-expect-error this is fine
      app.session[token] = {
        inactivityExpire: Date.now() + 20 * 60 * 1000, // 20 minutes
        fullExpire: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
        username: user.name,
        id: user.id,
      };

      resp.status(200).send({
        token,
        isTeacher: user.is_teacher,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      resp.status(500).send({
        error: 'Failed to verify OTP',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
