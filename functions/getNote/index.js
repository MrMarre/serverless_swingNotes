import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { db } from '../../database.js';

const getNote = async (event) => {
  const { userId } = JSON.parse(event.body);

  const params = {
    TableName: 'notes',
    key: {
      id: userId,
    },
    Item: note,
  };

  try {
    const command = new GetCommand(params);
    await db.send(command);
    return sendResponse(200, `Note with and id of ${userId} was found`, note);
  } catch (error) {
    return sendError(500, 'Could not create note');
  }
};

export const handler = getNote;
