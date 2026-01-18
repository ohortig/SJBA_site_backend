import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { logger } from '../logger.js';

interface EmailConfig {
     host: string;
     port: number;
     secure: boolean;
     auth: {
          user: string;
          pass: string;
     };
}

let transporter: Transporter | null = null;

/**
 * Get email configuration from environment variables
 */
const getEmailConfig = (): EmailConfig | null => {
     const host = process.env.SMTP_HOST;
     const port = process.env.SMTP_PORT;
     const user = process.env.SMTP_USER;
     const pass = process.env.SMTP_PASS;

     if (!host || !port || !user || !pass) {
          logger.warn({
               message: 'Email configuration incomplete - email sending is disabled',
               missing: {
                    host: !host,
                    port: !port,
                    user: !user,
                    pass: !pass
               }
          });
          return null;
     }

     return {
          host,
          port: parseInt(port, 10),
          secure: parseInt(port, 10) === 465,
          auth: { user, pass }
     };
};

/**
 * Initialize the email transporter
 */
export const initializeEmailTransporter = (): void => {
     const config = getEmailConfig();

     if (!config) {
          logger.info({ message: 'Email transporter not initialized - no configuration' });
          return;
     }

     transporter = nodemailer.createTransport(config);

     // Verify connection
     transporter.verify((error) => {
          if (error) {
               logger.error({
                    message: 'Email transporter verification failed',
                    error: error.message
               });
               transporter = null;
          } else {
               logger.info({ message: 'Email transporter ready' });
          }
     });
};

/**
 * Get the email transporter instance
 */
export const getEmailTransporter = (): Transporter | null => {
     return transporter;
};

/**
 * Check if email sending is available
 */
export const isEmailEnabled = (): boolean => {
     return transporter !== null;
};

/**
 * Send an email
 */
export const sendEmail = async (options: {
     to: string;
     subject: string;
     text: string;
     html?: string;
}): Promise<boolean> => {
     if (!transporter) {
          logger.warn({ message: 'Attempted to send email but transporter not initialized' });
          return false;
     }

     const from = process.env.SMTP_FROM || process.env.SMTP_USER;

     try {
          await transporter.sendMail({
               from,
               to: options.to,
               subject: options.subject,
               text: options.text,
               html: options.html
          });

          logger.info({
               message: 'Email sent successfully',
               to: options.to,
               subject: options.subject
          });

          return true;
     } catch (error) {
          logger.error({
               message: 'Failed to send email',
               error: error instanceof Error ? error.message : 'Unknown error',
               to: options.to,
               subject: options.subject
          });
          return false;
     }
};
