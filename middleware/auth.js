import JWT from 'jsonwebtoken';
import { sendError } from '../utils/responseHelper.js';

export const tokenValidator = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '');

      if (!token) throw new Error();

      const data = JWT.verify(token, process.env.JWT_SECRET);
      request.event.userId = data.userId;

      // console.log('Token data:', data);
      // console.log('Event efter tokenValidator:', request.event);

      return request.response;
    } catch (error) {
      console.log(error.message);
      return sendError(401, error.message);
    }
  },
};
