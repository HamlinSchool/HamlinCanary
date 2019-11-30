const AWS = require('aws-sdk');

const addDays = require('date-fns/addDays');
AWS.config.update({region: 'us-west-1' });
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

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

  // Call DynamoDB to add the item to the table
  return dynamodb.putItem(params).promise()
    .then(() => true)
    .catch((e) => {
      if (e.code === 'ConditionalCheckFailedException') {
          return false;
      }
      return Promise.reject(e);
    });
};

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
