import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

const setListMember =
  jest.fn<(listId: string, subscriberHash: string, payload: unknown) => Promise<void>>();
const updateListMemberTags =
  jest.fn<(listId: string, subscriberHash: string, payload: unknown) => Promise<void>>();

jest.unstable_mockModule('@mailchimp/mailchimp_marketing', () => ({
  default: {
    lists: {
      setListMember,
      updateListMemberTags,
    },
  },
}));

jest.unstable_mockModule('../logger.js', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('addSubscriber', () => {
  beforeEach(() => {
    process.env.DISABLE_MAILCHIMP_SYNC = 'false';
    process.env.MAILCHIMP_LIST_ID = 'test-list-id';
    setListMember.mockResolvedValue(undefined);
    updateListMemberTags.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.DISABLE_MAILCHIMP_SYNC;
    delete process.env.MAILCHIMP_LIST_ID;
    jest.clearAllMocks();
  });

  it('subscribes existing archived members during website signup', async () => {
    const { addSubscriber } = await import('./mailchimp.js');

    await addSubscriber('oh2065@stern.nyu.edu', 'Omer', 'Hortig');

    expect(setListMember).toHaveBeenCalledWith('test-list-id', expect.any(String), {
      email_address: 'oh2065@stern.nyu.edu',
      status: 'subscribed',
      status_if_new: 'subscribed',
      merge_fields: {
        FNAME: 'Omer',
        LNAME: 'Hortig',
        MMERGE6: 'Omer Hortig',
      },
    });
  });
});
