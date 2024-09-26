// const { v4: uuidv4 } = require('uuid');
// const AWS = require('aws-sdk');
// const middy = require('@middy/core');
// const jsonBodyParser = require('@middy/http-json-body-parser');
// const httpErrorHandler = require('@middy/http-error-handler');
// const { sendResponse, sendError } = require('./utils/responseHelper');

// const dynamoDB = new AWS.DynamoDB.DocumentClient();

// const createNote = async (event) => {
//   const data = event.body;

//   const note = {};

//   const params = {
//     TableName: 'NotesTable',
//     Item: note,
//   };

//   try {
//     await dynamoDB.put(params).promise();
//     return sendResponse(201, 'Note created', note);
//   } catch (error) {
//     return sendError(500, 'Could not create note');
//   }
// };

// module.exports.handler = middy(createNote)
//   .use(jsonBodyParser())
//   .use(httpErrorHandler());
