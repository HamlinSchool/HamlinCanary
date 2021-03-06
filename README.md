# Hamlin Canary
Air quality monitoring and reporting

Hamlin Canary runs at scheduled intervals, queries [purpleair sensors](https://www2.purpleair.com/), and sends a notification if the particle count is above the healthy threshold.

## The Hamlin Sensors

There are two [purpleair](https://www2.purpleair.com/collections/air-quality-sensors) sensors on the Hamlin campus:

* Science Labs
* Broadway

These sensors continuously monitor local air quality and expose a 'webpage' that contains the current sensor data in [JSON](https://www.json.org/json-en.html) format.  The code in this repository in combination with the resources described below periodically reads the sensor data and sends a notification when appropriate.

## Resources

To enable the Hamlin Canary a few different resources are stitched together.  The [logic](#logic-aws-lambda) that this code implements needs to run somewhere.  The running of the logic needs to be [scheduled](#schedule-aws-cloudwatch). To ensure that we only run the code once per scheduled interval, [state](#state-aws-dynamodb) must to be maintained.  When the code runs, if the particulate level is above a safe threshold a [notification](#notification-aws-sns) needs to be sent to the appropriate individuals.

Hamlin Canary is built using Amazon Web Service ([AWS](https://aws.amazon.com/)) resources.  Each resource used is described below.

### Logic: AWS Lambda

[AWS Lambda](https://aws.amazon.com/lambda/) is a service for running code without a dedicated computer.  Lambda is useful for discreet 'pieces' of functionality like the Hamlin Canary.

The configuration of the Lambda Function can be viewed and edited using the [Lambda Console](https://us-west-1.console.aws.amazon.com/lambda/home?region=us-west-1#/functions) which requires an AWS account with appropriate permissions.

The Lambda Function runs the code in [this GitHub repository](https://github.com/HamlinSchool/HamlinCanary).  The entry point for the Lambda is a [handler method](https://github.com/HamlinSchool/HamlinCanary/blob/master/index.js) which is triggered by the [schedule resource](#schedule-aws-cloudwatch). The documentation for the  [AWS Lambda Function Handler in Node.js](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html)

Three pieces of information are maintained in the Lambda Function [configuration](https://us-west-1.console.aws.amazon.com/lambda/home?region=us-west-1#/functions/HamlinCanary?tab=configuration) rather than being 'hard coded' into the javascript in this repository:
- [CANARY_READING_THRESHOLD](https://github.com/HamlinSchool/HamlinCanary/blob/00cebaa08e0769ebaadec0f604f82d14e0f9e517/src/sensor-service.js#L54) - the particle value above which an alert should be sent
- [CANARY_SERVER_LIST](https://github.com/HamlinSchool/HamlinCanary/blob/00cebaa08e0769ebaadec0f604f82d14e0f9e517/index.js#L19) - a comma separated list of sensor URLs to check
- [CANARY_SNS_TOPIC_ARN](https://github.com/HamlinSchool/HamlinCanary/blob/00cebaa08e0769ebaadec0f604f82d14e0f9e517/index.js#L20) - the resource where [notifications](#notification-AWS-SNS) are posted

### Schedule: AWS CloudWatch

The Hamlin Canary runs on a predefined schedule.  [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) is used to 'trigger' the Lambda Function at a preset interval.  The schedule can be set in the [CloudWatch Console](https://us-west-1.console.aws.amazon.com/cloudwatch/home?region=us-west-1#rules:name=CanaryTrigger;action=edit) which requires an AWS account with appropriate permissions.

### State: AWS DynamoDB

To ensure that data collection is [idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent), the Hamlin Canary Lambda Function stores each CloudWatch event in [DynamoDB](https://aws.amazon.com/dynamodb/) using the CloudWatch `event.id` as the unique key to prevent multiple runs with the same id.  The source of events, [AWS CloudWatch](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/RunLambdaSchedule.html), guarantees at least one delivery but can't guarantee that you won't receive more than one event.  To read more about it, [read this](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/).


To view the data in the `CanaryLog` table, use the [DynamoDB Console](https://us-west-1.console.aws.amazon.com/dynamodb/home?region=us-west-1#tables:selected=CanaryLog;tab=overview) which requires an AWS account with appropriate permissions.

### Notification: AWS SNS
When a reading is above the threshold a notification is sent to interested individuals.  Individuals can subscribe (and unsubscribe) to these notifications.  The AWS Simple Notification Service ([AWS SNS](https://aws.amazon.com/sns/?whats-new-cards.sort-by=item.additionalFields.postDateTime&whats-new-cards.sort-order=desc)) is used to reliably deliver notifications.  The current list of subscribers can be viewed in the [SNS Console](https://us-west-1.console.aws.amazon.com/sns/v3/home?region=us-west-1#/dashboard) which requires an AWS account with appropriate permissions.


## To Code:
The code in this repository is [javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) written to run on the NodeJs runtime.

To edit, test, and deploy the code in this repository a computer must meet the following pre-requisites:
- [git](https://git-scm.com/)
- [NodeJs](https://nodejs.org)
- an AWS account and [credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) with appropriate permissions
- obtain and set the environment variables: `CANARY_READING_THRESHOLD`, `CANARY_SERVER_LIST`, and `CANARY_SNS_TOPIC_ARN`

### Install the code:

```bash
cd ~/code
git clone git@github.com:HamlinSchool/HamlinCanary.git
cd HamlinCanary
npm install
```

### Test code on development computer:

```
npm start
```

### To deploy code to AWS Lambda

```
npm run deploy
```

## Some ideas for further exploration...
* Store the data to produce graphs and calculate: mean, median, standard deviation, etc.
* Understand what each of the dependencies does, why it is used, and understand its documentation
* Enable delivery of notifications via SMS
* Add unit tests which would allow for auto-update of dependencies
* Specify the name of the JSON key for data value to check using an environment variable so it can easily be changed without changing code

![](./img/tweety.jpg)

<sub>Disclaimer: this software and configuration is not professionally monitored or rigorously tested.   Use at own risk.</sub>
