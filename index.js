const { eventIsDupe } = require('./src/event-is-dupe');
const { processReadings, makeMessage } = require('./src/sensor-service');

/**
 * Entry point to the lambda function
 */
exports.handler = async (event) => {
  // check if we've already handled this observation
  if (!process.env.TEST && await eventIsDupe(event)) {
    const response = {
      statusCode: 200,
      body: 'event already processed',
    };

    return response
  };

  // This is the first time we've seen this event, so process it
  const sensors = process.env.CANARY_SERVER_LIST.split(','); // env var CANARY_SERVER_LIST configured with dashboard for lambda
  const overThresholdCount = await processReadings(sensors, 'v1', process.env.CANARY_READING_THRESHOLD);
  const message = makeMessage(overThresholdCount);
  const response = {
    statusCode: 201,
    body: `Event processed. ${message}.`,
  };

  // always log the message so we can see in Cloudfront
  console.log(message);

  return response;
};
