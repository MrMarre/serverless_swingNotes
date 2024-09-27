import { v4 as uuidv4 } from 'uuid';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { db } from '../../database.js';
import middy from '@middy/core';
import { tokenValidator } from '../../middleware/auth.js';

const createNote = async (event, context) => {
  const data = JSON.parse(event.body);
  console.log('event i createNote', event);

  const userId = event.userId;
  console.log('UserId i createNote:', userId);

  const note = {
    id: uuidv4(),
    title: data.title,
    text: data.text,
    userId: userId,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };

  const params = {
    TableName: 'notes',
    Item: note,
  };

  try {
    const command = new PutCommand(params);

    await db.send(command);

    return sendResponse(201, 'Note created', note);
  } catch (error) {
    console.error('Error', error);
    return sendError(500, error.message);
  }
};

export const handler = middy(createNote, {
  timeoutEarlyInMillis: 0,
  timeoutEarlyResponse: () => {
    return { statusCode: 408 };
  },
}).use(tokenValidator);
