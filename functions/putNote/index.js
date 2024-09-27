import middy from '@middy/core';
import { db } from '../../database.js';
import { tokenValidator } from '../../middleware/auth.js';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { sendError } from '../../utils/responseHelper.js';

const putNote = async (event) => {
  const { title, text } = JSON.parse(event.body);
  const { id } = event.pathParameters;
  const { userId } = event;
  console.log('Event', event);

  let modifiedAt = new Date().toISOString();

  const params = {
    TableName: 'notes',
    KeyConditionExpression: {
      id: id,
      userId: userId,
    },
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':id': id,
      ':userId': userId,
    },
    UpdateExpression:
      'SET #title = :title, #text = :text, #modifiedAt = :modifiedAt',
    ExpressionAttributeValues: {
      ':title': title,
      ':text': text,
      ':modifiedAt': modifiedAt,
    },
    ExpressionAttributeNames: {
      '#title': 'title',
      '#text': 'text',
      '#modifiedAt': 'modifiedAt',
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const command = new UpdateCommand(params);
    console.log('Command:', command);

    const result = await db.send(command);
    console.log('Result:', result);
  } catch (error) {
    return sendError(500, error.message);
  }
};

export const handler = middy(putNote, {
  timeoutEarlyInMillis: 0,
  timeoutEarlyResponse: () => {
    return { statusCode: 408 };
  },
}).use(tokenValidator);
