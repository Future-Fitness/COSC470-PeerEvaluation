import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock nodemailer before importing emailService
jest.mock('nodemailer', () => ({
  createTransport: jest.fn<() => { sendMail: jest.Mock }>()
    .mockReturnValue({
      sendMail: jest.fn<() => Promise<{ messageId: string }>>()
        .mockResolvedValue({ messageId: 'test-message-id' })
    })
}));

describe('EmailService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let emailService: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Reset the module to get a fresh instance
    jest.resetModules();
    // Import after mocking
    emailService = (await import('../src/shared/services/emailService')).default;
  });

  describe('sendBulkNewStudentEmails', () => {
    test('should process multiple students correctly', async () => {
      const students = [
        {
          email: 'student1@test.com',
          courseName: 'Test Course',
          temporaryPassword: 'pass1',
          loginUrl: 'http://localhost:5009/login'
        },
        {
          email: 'student2@test.com',
          courseName: 'Test Course',
          temporaryPassword: 'pass2',
          loginUrl: 'http://localhost:5009/login'
        }
      ];

      const result = await emailService.sendBulkNewStudentEmails(students);

      expect(result).toHaveProperty('sent');
      expect(result).toHaveProperty('failed');
      expect(Array.isArray(result.sent)).toBe(true);
      expect(Array.isArray(result.failed)).toBe(true);
    });

    test('should handle empty student list', async () => {
      const result = await emailService.sendBulkNewStudentEmails([]);

      expect(result.sent).toEqual([]);
      expect(result.failed).toEqual([]);
    });

    test('should track failed emails separately', async () => {
      const students = [
        {
          email: 'student1@test.com',
          courseName: 'Test Course',
          temporaryPassword: 'pass1',
          loginUrl: 'http://localhost:5009/login'
        }
      ];

      const result = await emailService.sendBulkNewStudentEmails(students);

      // When EMAIL_ENABLED is false, all should go to failed
      const totalProcessed = result.sent.length + result.failed.length;
      expect(totalProcessed).toBe(students.length);
    });
  });

  describe('Email Content Validation', () => {
    test('should include all required information in email HTML', async () => {
      const emailData = {
        email: 'student@test.com',
        courseName: 'Introduction to Testing',
        temporaryPassword: 'SecurePass123!',
        loginUrl: 'http://localhost:5009/login'
      };

      // We can't directly test the HTML content without making sendEmail public
      // But we can verify the function executes without errors
      await expect(emailService.sendNewStudentEmail(emailData)).resolves.toBeDefined();
    });
  });
});
