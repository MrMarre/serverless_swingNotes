import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { db } from '../../database.js';
import middy from '@middy/core';
import { tokenValidator } from '../../middleware/auth.js';

const queryNotesByUser = async (event) => {
  const { userId } = event.pathParameters;

  const params = {
    TableName: 'notes',
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await db.send(command);
    console.log('REsult from db send command', result);

    if (!result || !result.Items) {
      return sendError(404, 'No notes found for this user');
    }

    return sendResponse(
      200,
      `Notes for user ${userId} were found`,
      result.Items
    );
  } catch (error) {
    return sendError(500, error.message);
  }
};

export const handler = middy(queryNotesByUser, {
  timeoutEarlyInMillis: 0,
  timeoutEarlyResponse: () => {
    return { statusCode: 408 };
  },
}).use(tokenValidator);
