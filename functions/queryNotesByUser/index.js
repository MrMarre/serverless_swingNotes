import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { db } from '../../database.js';
import middy from '@middy/core';
import { tokenValidator } from '../../middleware/auth.js';

// Samma gäller här med range/sortKey och hash/partition, för att enbart kunna hämta
// anteckningar från given user.

const queryNotesByUser = async (event) => {
  const { userId } = event;

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
    console.log('command', command);
    const result = await db.send(command);
    console.log('Result from db send command:', result.Items);

    if (!result || !result.Items) {
      console.log('No notes found for this user');
      return sendError(404, 'No notes found for this user');
    }

    return sendResponse(
      200,
      `Notes for user ${userId} were found`,
      result.Items
    );
  } catch (error) {
    console.log('Error querying notes:', error);
    return sendError(500, error.message);
  }
};

export const handler = middy(queryNotesByUser, {
  timeoutEarlyInMillis: 0,
  timeoutEarlyResponse: () => {
    return { statusCode: 408 };
  },
}).use(tokenValidator);
