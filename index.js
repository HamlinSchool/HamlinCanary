const got = require('got');
const { eventIsDupe } = require('./src/event-is-dupe');

exports.handler = async (event) => {
  if (!process.env.TEST && await eventIsDupe(event)) {
    const response = {
      statusCode: 200,
      body: JSON.stringify('event already processed'),
    };

    return response
  };

  // Would be better to put this in a tables, but
  // for two servers, this is easier.  The env var
  // is configured in the aws dashboard for the lambda
  const sensors = process.env.CANARY_SERVER_LIST.split(',');
  const results = await Promise.all(sensors.map(server => got(server)));
  const response = {
    statusCode: 201,
    body: JSON.stringify('event processed'),
  };

  return response;
};
