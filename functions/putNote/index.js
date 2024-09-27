import middy from '@middy/core';
import { db } from '../../database.js';
import { tokenValidator } from '../../middleware/auth.js';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { sendError, sendResponse } from '../../utils/responseHelper.js';

const putNote = async (event) => {
  const { title, text } = JSON.parse(event.body);
  const { id } = event.pathParameters;
  const { userId } = event;
  console.log('Path Parameters:', event.pathParameters);
  console.log('Body:', event.body);
  console.log('Event', event);

  let modifiedAt = new Date().toISOString();

  const params = {
    TableName: 'notes',
    Key: {
      id: id,
    },
    UpdateExpression:
      'SET #title = :title, #text = :text, #modifiedAt = :modifiedAt',
    ExpressionAttributeNames: {
      '#title': 'title',
      '#text': 'text',
      '#modifiedAt': 'modifiedAt',
    },
    ExpressionAttributeValues: {
      ':title': title,
      ':text': text,
      ':modifiedAt': modifiedAt,
      ':userId': userId,
    },

    ConditionExpression: 'userId = :userId',
    ReturnValues: 'ALL_NEW',
  };
  console.log('UpdateCommand Params:', params);
  try {
    const command = new UpdateCommand(params);

    const result = await db.send(command);
    console.log('Result:', result);

    return sendResponse(200, 'JAJJEBULL', result.Attributes);
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
