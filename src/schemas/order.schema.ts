export const createOrderSchema = {
  tags: ['Order'],
  summary: 'Create new order',
  description: 'Place an order for products by user email',
  body: {
    type: 'object',
    required: ['name', 'order'],
    properties: {
      name: {
        type: 'string',
        format: 'email',
      },
      order: {
        type: 'array',
        items: {
          type: 'object',
          required: ['productId', 'qty'],
          properties: {
            productId: {
              type: 'string',
            },
            qty: {
              type: 'integer',
            },
          },
        },
      },
    },
  },
  response: {
    201: {
      description: 'Order creation confirmation',
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'order create success',
        },
      },
    },
  },
};

