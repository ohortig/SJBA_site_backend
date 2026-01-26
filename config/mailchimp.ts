import client from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';
import { logger } from '../logger.js';

// Initialize Mailchimp client
export const initializeMailchimp = (): void => {
     client.setConfig({
          apiKey: process.env.MAILCHIMP_API_KEY,
          server: process.env.MAILCHIMP_SERVER_PREFIX,
     });
};

// Test Mailchimp connection on startup
export const testMailchimpConnection = async (): Promise<void> => {
     try {
          const response = await client.ping.get();
          if (response && (response as { health_status?: string }).health_status === "Everything's Chimpy!") {
               logger.info({ message: 'Mailchimp connection successful' });
          } else {
               logger.warn({ message: 'Mailchimp ping returned unexpected response', response });
          }
     } catch (error: any) {
          logger.error({ message: 'Mailchimp connection failed', error: error.message || error });
     }
};

export const addSubscriber = async (email: string, firstName: string, lastName: string): Promise<void> => {
     const listId = process.env.MAILCHIMP_LIST_ID;

     if (!listId) {
          logger.error('MAILCHIMP_LIST_ID is not defined in environment variables');
          return;
     }

     const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

     try {
          await client.lists.setListMember(listId, subscriberHash, {
               email_address: email,
               status_if_new: 'subscribed',
               merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName,
                    MMERGE6: `${firstName} ${lastName}`,
               },
          });

          // Add tag to track website signups
          await client.lists.updateListMemberTags(listId, subscriberHash, {
               tags: [{ name: 'Website Signup', status: 'active' }],
          });

          logger.info(`Successfully added/updated subscriber ${email} to Mailchimp list`);
     } catch (error: any) {
          logger.error('Error adding/updating subscriber to Mailchimp:', error);
          throw error; // Re-throw to handle in the route
     }
};

export const removeSubscriber = async (email: string): Promise<void> => {
     const listId = process.env.MAILCHIMP_LIST_ID;

     if (!listId) {
          logger.error('MAILCHIMP_LIST_ID is not defined in environment variables');
          return;
     }

     const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

     try {
          await client.lists.deleteListMember(listId, subscriberHash);
          logger.info(`Successfully removed subscriber ${email} from Mailchimp list`);
     } catch (error: any) {
          logger.error('Error removing subscriber from Mailchimp:', error);
          throw error; // Re-throw to handle in the route
     }
};
