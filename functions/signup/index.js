import middy from '@middy/core';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import { db } from '../../database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

const signUp = async (event, context) => {
  console.log('Received event:', event);

  try {
    const { username, password, email, firstname, lastname } = JSON.parse(
      event.body
    );
    if (!username || !password || !email || !firstname || !lastname) {
      return sendError(400, 'Missing required fields');
    }
    const hashedPassword = await hashPassword(password);

    const user = {
      userId: uuidv4(),
      username: username,
      password: hashedPassword,
      email: email,
      firstname: firstname,
      lastname: lastname,
    };
    const params = {
      TableName: process.env.USERS_TABLE,
      Item: user,
    };
    console.log('USERS_TABLE', process.env.USERS_TABLE);
    const command = new PutCommand(params);

    await db.send(command);

    console.log('USER SUCCESSFULLY CREATED');

    return sendResponse(200, 'success', user);
  } catch (error) {
    console.log(error);
    return sendError(500, error.message);
  }
};
// En fungerande timeout för att motverka abortController
export const handler = middy(signUp, {
  timeoutEarlyInMillis: 0,
  timeoutEarlyResponse: () => {
    return { statusCode: 408 };
  },
});
