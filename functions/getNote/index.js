import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { db } from '../../database.js';
import middy from '@middy/core';
import { tokenValidator } from '../../middleware/auth.js';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const getNote = async (event) => {
  const { id } = event.pathParameters;
  const { userId } = event;
  console.log('Event:', event);

  // En liten range-key(sort-key) och vanlig hashkey för att säkerställa att enbart rätt användare
  // kan hämta ut anteckningar kopplade till användaren.
  // Den kopplingen/sammansättningen kan alltså mangla ihop ett samband

  const params = {
    TableName: 'notes',
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':id': id,
    },
    FilterExpression: 'id = :id',
  };

  try {
    const command = new QueryCommand(params);
    console.log('Command get', command);
    const result = await db.send(command);
    console.log(result);

    if (result.Items) {
      return sendResponse(200, `Note with id ${id} was found`, result.Items);
    } else {
      return sendError(404, 'Note not found');
    }
  } catch (error) {
    return sendError(500, 'Could not fetch note');
  }
};

export const handler = middy(getNote, {
  timeoutEarlyInMillis: 0,
  timeoutEarlyResponse: () => {
    return { statusCode: 408 };
  },
}).use(tokenValidator);
