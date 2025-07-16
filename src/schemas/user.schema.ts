export const getUserSchema = {
  tags: ['User'],
  summary: 'Get list of users',
  response: {
    200: {
      description: 'Successful response',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string',example: '7f7a7924-59a0-4565-a868-014f2d377b38' },
          name: { type: 'string' ,example:'John Doe' },
          email: { type: 'string', example: 'XKQ1M@example.com' },
        },
        required: ['id', 'name', 'email'], // Optional, ช่วย validate schema
      },
    },
  },
};

export const getByEmailSchema = {
  tags: ['User'],
  summary: 'get User By Email',
  description: 'Returns user info for a given email',
  querystring: {
    type: 'object',
    properties: {
      email: { type: 'string'},
    },
    required: ['email'],
  },
  response: {
    200: {
      description: 'Example response',
      type: 'object',
      properties: {
        id: { type: 'string', example: '123' },
        name: { type: 'string', example: 'June' },
        email: { type: 'string', example: 'june1@example.com' },
      },
    },
  },
};
export const getUserLogSchema = {
  tags: ['User'],
  summary: 'Get user logs',
  description: 'Return nested event logs with payloads',
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'cc74bbc0-da64-4568-a3c6-f54b21a3178a' },
          timestamp: { type: 'string', format: 'date-time', example: '2025-07-01T01:27:56.437Z' },
          eventType: { type: 'string', example: 'LogCreated' },
          source: { type: 'string', example: 'unknow' },
          payload: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              timestamp: { type: 'string', format: 'date-time' },
              eventType: { type: 'string' },
              source: { type: 'string' },
              payload: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      userId: { type: 'string', format: 'uuid' },
                      name: { type: 'string' },
                    },
                    required: ['userId', 'name'],
                  },
                  {
                    type: 'object',
                    properties: {
                      userId: { type: 'string', format: 'uuid' },
                      product: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            productId: { type: 'string' },
                            qty: { type: 'integer' },
                          },
                          required: ['productId', 'qty'],
                        },
                      },
                    },
                    required: ['userId', 'product'],
                  },
                ],
              },
            },
            required: ['id', 'timestamp', 'eventType', 'payload'],
          },
        },
        required: ['id', 'timestamp', 'eventType', 'payload', 'source'],
      },
    },
  },
};


export const createUserSchema = {
  tags: ['User'],
  summary: 'Create a new user',
  description: 'Accepts user details and creates a new user',
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string'},
      email: { type: 'string', format: 'email' },
    },
  },
  response: {
    201: {
      description: 'User created successfully',
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User created successfully' },
      }
    },
  },
};

