import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SJBA API',
      version: '1.0.0',
      description:
        'Backend API for the Stern Jewish Business Association (SJBA) website. Provides endpoints for board members, events, contact form submissions, newsletter signups, members, and semesters.',
    },
    servers: [
      {
        url: 'https://api.nyu-sjba.org',
        description: 'Production',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development',
      },
    ],
    tags: [
      { name: 'Board Members', description: 'Board member directory' },
      { name: 'Events', description: 'Event listings and search' },
      { name: 'Contact', description: 'Contact form submissions' },
      { name: 'Newsletter', description: 'Newsletter signups via Mailchimp' },
      { name: 'Members', description: 'Club membership' },
      { name: 'Semesters', description: 'Academic semester management' },
      { name: 'Health', description: 'Server health & info' },
    ],
    components: {
      schemas: {
        // ── Shared ────────────────────────────────────────────
        ApiError: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
            reqBody: { type: 'object', nullable: true },
          },
          required: ['message', 'code'],
        },
        ApiError403: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Forbidden - Invalid referer' },
                code: { type: 'string', example: 'INVALID_REFERER' },
              },
            },
          },
        },
        ApiError429: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  example: 'Too many requests from this IP, please try again later.',
                },
                code: { type: 'string', example: 'RATE_LIMIT_EXCEEDED' },
              },
            },
          },
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },

        // ── Board Members ─────────────────────────────────────
        BoardMember: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            position: { type: 'string', example: 'President' },
            fullName: { type: 'string', example: 'Jane Doe' },
            bio: { type: 'string' },
            major: { type: 'string', example: 'Finance' },
            year: { type: 'string', example: '2026' },
            hometown: { type: 'string', example: 'New York, NY' },
            linkedinUrl: { type: 'string', nullable: true, format: 'uri' },
            email: { type: 'string', format: 'email' },
            headshotFile: { type: 'string', nullable: true },
            orderIndex: { type: 'integer' },
          },
        },

        // ── Events ────────────────────────────────────────────
        Event: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            title: { type: 'string', example: 'Finance Panel' },
            company: { type: 'string', example: 'Goldman Sachs' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            location: { type: 'string', example: 'KMC 2-60' },
            flyerFile: { type: 'string', nullable: true },
            rsvpLink: { type: 'string', nullable: true, format: 'uri' },
            description: { type: 'string', nullable: true },
            semester: { type: 'string', example: 'Spring 2026' },
          },
        },

        // ── Newsletter ────────────────────────────────────────
        NewsletterSignup: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Members ───────────────────────────────────────────
        Member: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            semester: { type: 'string', example: 'Spring 2026' },
            email: { type: 'string', nullable: true, format: 'email' },
          },
        },

        // ── Semesters ─────────────────────────────────────────
        Semester: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            semesterName: { type: 'string', example: 'Spring 2026' },
          },
        },
      },
    },
    paths: {
      // ═══════════════════════════════════════════════════════
      //  Health / Info
      // ═══════════════════════════════════════════════════════
      '/': {
        get: {
          tags: ['Health'],
          summary: 'Root – API info',
          responses: {
            '200': {
              description: 'API metadata',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      version: { type: 'string' },
                      status: { type: 'string' },
                      description: { type: 'string' },
                      endpoints: { type: 'object' },
                    },
                  },
                },
              },
            },
            '/v1': {
              get: {
                tags: ['Health'],
                summary: 'API Version Info',
                responses: {
                  '200': {
                    description: 'API version and documentation link',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            version: { type: 'string' },
                            documentation: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Server is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number', description: 'Uptime in seconds' },
                      environment: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ═══════════════════════════════════════════════════════
      //  Board Members
      // ═══════════════════════════════════════════════════════
      '/v1/board-members': {
        get: {
          tags: ['Board Members'],
          summary: 'Get all board members',
          responses: {
            '200': {
              description: 'List of board members',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/BoardMember' },
                      },
                    },
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden (CORS/Referer)',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError403' } },
              },
            },
            '429': {
              description: 'Too Many Requests',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError429' } },
              },
            },
          },
        },
      },
      '/v1/board-members/{id}': {
        get: {
          tags: ['Board Members'],
          summary: 'Get a single board member by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Board member UUID',
            },
          ],
          responses: {
            '200': {
              description: 'Board member found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/BoardMember' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid UUID',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Board member not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ═══════════════════════════════════════════════════════
      //  Events
      // ═══════════════════════════════════════════════════════
      '/v1/events': {
        get: {
          tags: ['Events'],
          summary: 'Get all events (paginated, filterable)',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
              description: 'Page number',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
              description: 'Results per page',
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Search in title and description',
            },
            {
              name: 'startDate',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description: 'Only events starting on or after this date (ISO 8601 date or datetime)',
            },
            {
              name: 'endDate',
              in: 'query',
              schema: { type: 'string', format: 'date-time' },
              description:
                'Only events starting on or before this date (ISO 8601 date or datetime)',
            },
          ],
          responses: {
            '200': {
              description: 'Paginated list of events',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      pagination: { $ref: '#/components/schemas/PaginationInfo' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Event' },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/events/upcoming': {
        get: {
          tags: ['Events'],
          summary: 'Get upcoming events',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 50, default: 5 },
              description: 'Max number of upcoming events to return',
            },
          ],
          responses: {
            '200': {
              description: 'List of upcoming events',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Event' },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/v1/events/{id}': {
        get: {
          tags: ['Events'],
          summary: 'Get a single event by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Event UUID',
            },
          ],
          responses: {
            '200': {
              description: 'Event found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Event' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid UUID',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Event not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ═══════════════════════════════════════════════════════
      //  Contact
      // ═══════════════════════════════════════════════════════
      '/v1/contact': {
        post: {
          tags: ['Contact'],
          summary: 'Submit a contact form',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'email', 'message'],
                  properties: {
                    firstName: {
                      type: 'string',
                      maxLength: 100,
                      description: 'First name of the sender',
                    },
                    lastName: {
                      type: 'string',
                      maxLength: 100,
                      description: 'Last name of the sender',
                    },
                    email: { type: 'string', format: 'email' },
                    company: {
                      type: 'string',
                      maxLength: 255,
                      description: 'Optional company name',
                    },
                    message: { type: 'string', maxLength: 5000 },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Contact form submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: {
                        type: 'string',
                        example: 'Thank you for your message. We will get back to you soon!',
                      },
                      data: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean' },
                          message: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
            '500': {
              description: 'Failed to save submission or send notification email',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden (CORS/Referer)',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError403' } },
              },
            },
            '429': {
              description: 'Too Many Requests',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ApiError429' } },
              },
            },
          },
        },
      },

      // ═══════════════════════════════════════════════════════
      //  Newsletter
      // ═══════════════════════════════════════════════════════
      '/v1/newsletter-sign-ups': {
        post: {
          tags: ['Newsletter'],
          summary: 'Sign up for the newsletter',
          description:
            'Subscribes the user to the Mailchimp newsletter list and saves the signup in the database. Email must be an NYU email address (@nyu.edu).',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'first_name', 'last_name'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      description: 'Must be an @nyu.edu address',
                      example: 'jd1234@stern.nyu.edu',
                    },
                    first_name: { type: 'string', maxLength: 50 },
                    last_name: { type: 'string', maxLength: 50 },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'New signup created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/NewsletterSignup' },
                    },
                  },
                },
              },
            },
            '200': {
              description: 'Existing signup updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/NewsletterSignup' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error (invalid email, missing fields)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
            '500': {
              description: 'Mailchimp or database error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ═══════════════════════════════════════════════════════
      //  Members
      // ═══════════════════════════════════════════════════════
      '/v1/members': {
        get: {
          tags: ['Members'],
          summary: 'Get all members',
          responses: {
            '200': {
              description: 'List of members',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Member' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Members'],
          summary: 'Create a new member',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['firstName', 'lastName', 'semester'],
                  properties: {
                    firstName: { type: 'string', maxLength: 100 },
                    lastName: { type: 'string', maxLength: 100 },
                    semester: {
                      type: 'string',
                      description: 'Must match an existing semester name',
                      example: 'Spring 2026',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                      nullable: true,
                      description: 'Optional email address',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Member created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Member' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error or invalid semester',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
      },

      // ═══════════════════════════════════════════════════════
      //  Semesters
      // ═══════════════════════════════════════════════════════
      '/v1/semesters': {
        get: {
          tags: ['Semesters'],
          summary: 'Get all semesters',
          responses: {
            '200': {
              description: 'List of semesters',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      count: { type: 'integer' },
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Semester' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Semesters'],
          summary: 'Create a new semester',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['semesterName'],
                  properties: {
                    semesterName: {
                      type: 'string',
                      maxLength: 100,
                      example: 'Fall 2026',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Semester created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: { $ref: '#/components/schemas/Semester' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
            '409': {
              description: 'Semester with this name already exists',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { $ref: '#/components/schemas/ApiError' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  // No JSDoc annotations to scan — everything is defined inline above
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
