const sendResponse = (statusCode, message, data = null) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      message,
      ...(data && { data }),
    }),
  };
};

const sendError = (statusCode, errorMessage) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({ error: errorMessage }),
  };
};

export { sendResponse, sendError };
