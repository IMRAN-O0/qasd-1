const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const sendPaginatedResponse = (res, data, pagination, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
  });
};

module.exports = {
  sendSuccess,
  sendPaginatedResponse,
};