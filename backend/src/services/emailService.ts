import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface NewStudentEmailData {
  email: string;
  courseName: string;
  temporaryPassword: string;
  loginUrl: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    
    if (!emailEnabled) {
      console.log('Email service is disabled. Set EMAIL_ENABLED=true to enable.');
      return;
    }

    const emailService = process.env.EMAIL_SERVICE || 'gmail';
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.warn('Email credentials not configured. Emails will not be sent.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: emailService,
        auth: {
          user: emailUser,
          pass: emailPassword,
        },
      });

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log(`Email would be sent to ${options.to}: ${options.subject}`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error(`Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendNewStudentEmail(data: NewStudentEmailData): Promise<boolean> {
    const { email, courseName, temporaryPassword, loginUrl } = data;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .info-box {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .credential {
              font-family: 'Courier New', monospace;
              background: #f3f4f6;
              padding: 10px;
              border-radius: 4px;
              margin: 5px 0;
              display: inline-block;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 15px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to Peer Evaluation System</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            
            <p>You have been registered in the course: <strong>${courseName}</strong></p>
            
            <div class="info-box">
              <h3>Your Account Details</h3>
              <p>Your account has been created with the following credentials:</p>
              <p><strong>Email:</strong> <span class="credential">${email}</span></p>
              <p><strong>Temporary Password:</strong> <span class="credential">${temporaryPassword}</span></p>
            </div>

            <div class="warning">
              <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
            </div>

            <center>
              <a href="${loginUrl}" class="button">Login to Your Account</a>
            </center>

            <div class="info-box">
              <h3>Two Ways to Login</h3>
              <p><strong>Option 1: Password Login</strong></p>
              <ol>
                <li>Click "🔑 Password" tab</li>
                <li>Use the username from your email (before @)</li>
                <li>Enter your temporary password above</li>
              </ol>

              <p><strong>Option 2: Email Code (Recommended)</strong></p>
              <ol>
                <li>Click "📧 Email Code" tab</li>
                <li>Enter your email: <strong>${email}</strong></li>
                <li>Check your inbox for a 6-digit code</li>
                <li>Enter the code to login securely</li>
              </ol>
            </div>

            <p>If you have any questions or need assistance, please contact your course instructor.</p>

            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Peer Evaluation System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `You've been registered in ${courseName} - Account Created`,
      html,
    });
  }

  async sendBulkNewStudentEmails(students: NewStudentEmailData[]): Promise<{
    sent: string[];
    failed: string[];
  }> {
    const results = {
      sent: [] as string[],
      failed: [] as string[],
    };

    for (const student of students) {
      const success = await this.sendNewStudentEmail(student);
      if (success) {
        results.sent.push(student.email);
      } else {
        results.failed.push(student.email);
      }
    }

    return results;
  }

  async sendOTPEmail(email: string, otp: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .otp-box {
              background: white;
              padding: 30px;
              border-radius: 8px;
              margin: 20px 0;
              border: 2px solid #667eea;
              text-align: center;
            }
            .otp-code {
              font-family: 'Courier New', monospace;
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              padding: 20px;
              background: #f3f4f6;
              border-radius: 8px;
              display: inline-block;
              margin: 10px 0;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 15px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔐 Your Login Code</h1>
          </div>
          <div class="content">
            <p>Hello,</p>

            <p>You requested to log in to the Peer Evaluation System. Use the code below to complete your login:</p>

            <div class="otp-box">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Your One-Time Password (OTP)</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">This code will expire in 10 minutes</p>
            </div>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email. Never share this code with anyone.
            </div>

            <p>For your security:</p>
            <ul>
              <li>This code can only be used once</li>
              <li>It will expire in 10 minutes</li>
              <li>Do not share this code with anyone</li>
            </ul>

            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Peer Evaluation System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Your Login Code - Peer Evaluation System',
      html,
    });
  }
}

export default new EmailService();
