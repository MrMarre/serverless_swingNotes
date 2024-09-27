import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { db } from '../../database.js';
import middy from '@middy/core';
import { tokenValidator } from '../../middleware/auth.js';

const getNote = async (event) => {
  const { id } = event.pathParameters;

  // En liten range-key(sort-key) och vanlig hashkey för att säkerställa att enbart rätt användare
  // kan hämta ut anteckningar kopplade till användaren.
  // Den kopplingen/sammansättningen kan alltså mangla ihop ett samband

  const params = {
    TableName: 'notes',
    Key: {
      id: id,
    },
  };

  try {
    const command = new GetCommand(params);
    const result = await db.send(command);

    if (result.Item) {
      return sendResponse(200, `Note with id ${id} was found`, result.Item);
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
