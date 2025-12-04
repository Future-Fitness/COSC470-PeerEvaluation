import { FastifyInstance } from 'fastify';
import models from '../../../util/database';
import emailService from '../../../shared/services/emailService';
import { Op } from 'sequelize';

const User = models.User;
const OTP = models.OTP;

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function (app: FastifyInstance) {
  app.post('/request_otp', async (req, resp) => {
    try {
      const { email } = req.body as { email: string };

      if (!email) {
        resp.status(400).send({ error: 'Email is required' });
        return;
      }

      // Check if user exists
      const user = await User.findOne({ where: { email } });

      if (!user) {
        resp.status(404).send({ error: 'No account found with this email' });
        return;
      }

      // Invalidate any existing unused OTPs for this email
      await OTP.update(
        { is_used: true },
        {
          where: {
            email,
            is_used: false,
            expires_at: {
              [Op.gt]: new Date()
            }
          }
        }
      );

      // Generate new OTP
      const otpCode = generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

      // Save OTP to database
      await OTP.create({
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
        is_used: false
      });

      // Send OTP via email
      const emailSent = await emailService.sendOTPEmail(email, otpCode);

      if (!emailSent) {
        console.warn(`Failed to send OTP email to ${email}, but OTP was created`);
      }

      resp.send({
        message: 'OTP sent to your email',
        email,
        expiresIn: 600 // seconds
      });
    } catch (error) {
      console.error('Error requesting OTP:', error);
      resp.status(500).send({
        error: 'Failed to request OTP',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
