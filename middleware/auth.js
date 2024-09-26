import JWT from 'jsonwebtoken';
import { sendError } from '../utils/responseHelper';

export const tokenValidator = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace('Bearer ', '');

      if (!token) throw new Error();

      const data = JWT.verify(token, process.env.jwt_secret);
      request.event.userId = data.userId;

      return request.response;
    } catch (error) {
      console.log(error.message);
      return sendError(500, 'Unauthorized');
    }
  },
};
