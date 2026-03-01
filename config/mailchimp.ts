import client from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';
import { logger } from '../logger.js';

// Initialize Mailchimp client
export const initializeMailchimp = (): void => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !serverPrefix) {
    const missingVars: string[] = [];
    if (!apiKey) {
      missingVars.push('MAILCHIMP_API_KEY');
    }
    if (!serverPrefix) {
      missingVars.push('MAILCHIMP_SERVER_PREFIX');
    }

    const message = `Missing required Mailchimp environment variable(s): ${missingVars.join(', ')}`;
    // logger.error(message);
    // throw new Error(message);
    logger.warn(message);
    return; // Skip Mailchimp initialization but allow the app to run
  }

  client.setConfig({
    apiKey,
    server: serverPrefix,
  });
};

// Test Mailchimp connection on startup
export const testMailchimpConnection = async (): Promise<void> => {
  try {
    const response = await client.ping.get();
    if (
      response &&
      (response as { health_status?: string }).health_status === "Everything's Chimpy!"
    ) {
      logger.info({ message: 'Mailchimp connection successful' });
    } else {
      logger.warn({ message: 'Mailchimp ping returned unexpected response', response });
    }
  } catch (error: unknown) {
    logger.error({
      message: 'Mailchimp connection failed',
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const addSubscriber = async (
  email: string,
  firstName: string,
  lastName: string
): Promise<void> => {
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!listId) {
    const error = new Error('MAILCHIMP_LIST_ID is not defined in environment variables');
    logger.error(error.message);
    throw error;
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
  } catch (error: unknown) {
    logger.error({
      message: 'Error adding/updating subscriber to Mailchimp:',
      error: error instanceof Error ? error.message : error,
    });
    throw error; // Re-throw to handle in the route
  }
};

export const removeSubscriber = async (email: string): Promise<void> => {
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!listId) {
    const error = new Error('MAILCHIMP_LIST_ID is not defined in environment variables');
    logger.error(error.message);
    throw error;
  }

  const subscriberHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

  try {
    await client.lists.deleteListMember(listId, subscriberHash);
    logger.info(`Successfully removed subscriber ${email} from Mailchimp list`);
  } catch (error: unknown) {
    logger.error({
      message: 'Error removing subscriber from Mailchimp:',
      error: error instanceof Error ? error.message : error,
    });
    throw error; // Re-throw to handle in the route
  }
};
