import { v4 as uuidv4 } from 'uuid';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { db } from '../../database.js';

const createNote = async (event, context) => {
  const data = JSON.parse(event.body);

  const note = {
    id: uuidv4(),
    title: data.title,
    text: data.text,
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

export const handler = createNote;
