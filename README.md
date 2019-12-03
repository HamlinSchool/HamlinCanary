# Hamlin Canary
Notify if Air Monitors report above threshold

Hamlin Canary runs at scheduled intervals.  It queries the purple air sensors and sends a notification if air quality is worse than a preset threshold.

Canary uses AWS Cloud Watch to send events to AWS Lambda on a preset schedule.

To ensure that our data collection is [idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent) the [AWS Lambda Function](https://aws.amazon.com/lambda/features/) stores the event in DynamoDB using the `event.id` as the unique key to prevent multiple runs with the same id.  The source of our events [AWS CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/RunLambdaSchedule.html) guarantees at least one delivery, but can't guarantee that you wont receive more than one event.  You can [read more about it](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/).

## The Hamlin Sensors

There are two [purple air](https://www2.purpleair.com/collections/air-quality-sensors) sensors:

* Science Labs
* Broadway

The sensors are in pairs (TODO: add picture and copy summary of purple air explaining how they work)

Currently, the list of sensors is stored as an environment variable in the lambda function configuration.  We want the list out of our code, since our code is pubic and the list has to contain some authentication information for accessing the purple air data.  The list should probably be stored in AWS Secret Manager or it could also be in a Dynamo DB table, but putting it in an environment variable was nice and easy and is adequate when we only have two or three resources to keep track of.

## To Code:

1. ensure that you have proper AWS configuration and credentials on your local machine (link, and/or steps to complete)

2. Clone this repo and install dependencies:

```
cd ~/code
git clone git@github.com:HamlinSchool/canary.git
cd canary
npm install
```

3. To deploy code to AWS (requires that your permissions with AWS are properly configured)

```
npm run deploy
```

### To Do
* Store the data and produce graphs


![](./img/tweety.jpg)
