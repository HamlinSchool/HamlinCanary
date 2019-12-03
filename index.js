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
  const observations = await Promise.all(sensors.map(server => got(server).json()));
  const sensorReadings = observations.reduce((accumulator, observation) => {
    observation.results.forEach((sensor) => {
      const label = sensor.Label;
      const reading = JSON.parse(sensor.Stats).v1;
      accumulator.push({ label, reading });
    });
    return accumulator;
  }, []);

  const aboveThreshold = sensorReadings.filter(sensor => sensor.reading > 13);

  const response = {
    statusCode: 201,
    body: JSON.stringify('event processed'),
  };

    return response;
};
