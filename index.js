const { eventIsDupe } = require('./src/event-is-dupe');

exports.handler = async (event) => {
  if (!process.env.TEST && await eventIsDupe(event)) {
    const response = {
      statusCode: 200,
      body: JSON.stringify('event already processed'),
    };

    return response
  };

  const response = {
    statusCode: 201,
    body: JSON.stringify('event processed'),
  };

  return response;
};
