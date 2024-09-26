import JWT from 'jsonwebtoken';
import middy from '@middy/core';
import { db } from '../../database.js';
import { sendError, sendResponse } from '../../utils/responseHelper.js';
import bcrypt from 'bcryptjs';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

async function passwordCheck(password, user) {
  try {
    const isCorrect = await bcrypt.compare(password, user.password);

    return isCorrect;
  } catch (error) {
    console.error('Error comparing password', error);
    throw error;
  }
}

function signToken(user) {
  try {
    const token = JWT.sign(
      { userId: user.userId, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: 3600,
      }
    );
    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const params = {
      TableName: 'users',
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
    };
    console.log('params from gUBUN-function', params);

    const command = new QueryCommand(params);
    console.log('Command', command);

    const result = await db.send(command);
    console.log('DynamoDB query result:', result);

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return result.Items[0]; // Returnerar första matchande användarobjektet
  } catch (error) {
    console.error('Error fetching user from DynamoDB:', error);
    throw error;
  }
}

const logIn = async (event, context) => {
  try {
    const { username, password } = JSON.parse(event.body);

    const user = await getUserByUsername(username);

    if (!user) return sendError(401, 'Wrong username or password');

    const pwVerifier = await passwordCheck(password, user);

    console.log('Password verification result:', pwVerifier);

    if (!pwVerifier) return sendError(401, 'Wrong username or password');

    const token = signToken(user);
    console.log('Generated token:', token);

    return sendResponse(200, 'success', token);
  } catch (error) {
    console.log('Error:', error);
    return sendError(500, error.message);
  }
};

export const handler = logIn;
