const addDays = require('date-fns/addDays');
const AWS = require('aws-sdk');

AWS.config.update({region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

/**
 * Determine if this event has already been processed
 *
 * AWS CloudWatch delivers events AT LEAST ONCE, so sometimes we'll get dupes.
 * We don't want to send duplicate notifications, so we de dupe events here
 *
 * We use AWS DynamoDB to store a record with the id of the event.
 * When we go to put a new record in, if its is a duplicate, we know
 * we've already handled this event.
 *
 * The table `CanaryLog`is configured to expire records after a day.  Realistically,
 * we'd only get  dupe with in a few hundred milliseconds. If it turns out that
 * we need to keep data for graphing, etc. this would be the place to store it
 * and then you'd want to turn off the expiration.  The data is very small,
 * so storing hundreds of years of observations would trivial.
 *
 * @param {*} event
 * @returns promise<boolean> true if this event has already been processed
 */
const eventIsDupe = function eventIsDupe(event) {
  const params = {
    TableName: 'CanaryLog',
    Item: {
      'id' : {S: event.id},
      'eventTime': { S: event.time },
      'expires': {S: addDays(new Date(event.time), 1).toISOString() }
    },
    ConditionExpression: 'attribute_not_exists(id)',
  };

  return dynamodb.putItem(params).promise()
    .then(() => false) // it's not a dupe
    .catch((e) => {
      if (e.code === 'ConditionalCheckFailedException') {
          return true; // it's a dupe
      }
      return Promise.reject(e);
    });
};

module.exports = { eventIsDupe };
