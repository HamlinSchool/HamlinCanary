const got = require('got'); // library for fetching webpages: https://github.com/sindresorhus/got
const AWS = require('aws-sdk');
const numWords = require('num-words');
const capitalize = require('capitalize');
const pluralise = require('pluralise');

AWS.config.update({region: 'us-west-1'});

/**
 * Create a human friendly message
 * @param {number} alertCount
 * @returns {string} a human readable phrase of the result
 */
const makeMessage = function makeMessage(alertCount) {
  const suffix = 'above threshold';
  const subject = pluralise(alertCount, 'sensor');
  const countAsString = alertCount === 0
    ? 'no'
    : numWords(alertCount);

  const message = `${capitalize(countAsString)} ${subject} ${suffix}`;
  return message;
};


/**
 * Create a human friendly message body
 * @param {array<object>} aboveThreshold sensors with label and reading
 * @returns {string} message body
 */
const makeMessageBody = function makeMessageBody(aboveThreshold) {
  // fat arrow short hand for function =>
  const format = sensor => `${sensor.label}: ${sensor.reading}`;
  const formatedList = aboveThreshold.map(format);
  return formatedList.join("\n");
};

/**
 * Send an alert to subscribers of the Hamlin Canary
 *
 * Send a message to the Hamlin Canary SNS topic with
 * information about sensors that are over the threshold.
 *
 * @param {array<object>} aboveThreshold sensors with label and reading
 */
const sendAlert = async function sendAlert(aboveThreshold) {
  if (aboveThreshold.length === 0) {
    return; // nothing to do here.
  }

  const params = {
    Subject: `Hamlin Canary: ${makeMessage(aboveThreshold.length)}`,
    Message: makeMessageBody(aboveThreshold),
    TopicArn: process.env.SNS_TOPIC_ARN, // environment variable set in lambda console
  };

  publishResult = await new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();
  return publishResult;
}

/**
 * Inspect sensors to determine which are in an 'alarm' state
 *
 * Take a list of sensors, query them for current data and determine which
 * sensors, if any are above the supplied threshold
 *
 * @param {string[]} sensors array of sensors to query
 * @param {string} key element in the sensor's response to evaluate
 * @param {string} threshold above which a sensor is in alarm state
 * @returns {number} count of sensors above threshold
 */
const processReadings  = async function processReadings(sensors, key = 'v1',  threshold = 100) {
  // fetch the observations from each sensor
  const observations = await Promise.all(sensors.map(server => got(server).json()));
  // process each observation to the reading we are interested in
  const sensorReadings = observations.reduce((accumulator, observation) => {
    observation.results.forEach((sensor) => {
      const label = sensor.Label;
      const reading = JSON.parse(sensor.Stats)[key];
      accumulator.push({ label, reading });
    });
    return accumulator;
  }, []);

  // filter readings for any over the threshold
  const aboveThreshold = sensorReadings.filter(sensor => sensor.reading > threshold);

  // send a notification for any aboveThreshold readings
  await sendAlert(aboveThreshold);

  return aboveThreshold.length;
};

module.exports = {
  processReadings,
  makeMessage,
 };
