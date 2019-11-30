# Hamlin Canary
Notify if Air Monitors report above threshold

Hamlin Canary runs at scheduled intervals.  It queries the purple air sensors and sends a notification if air quality is worse than a preset threshold.

Canary uses AWS Cloud Watch to send events to AWS Lambda on a preset schedule.

AWS Lambda stores the event in DynamoDB using the event.id as the unique key to prevent multiple runs with the same id (because CloudWatch guarantees at least one delivery, but can be more).

... next steps to come.

## To Code:

1. ensure that you have proper AWS configuration and credentials on your lokcal machine (link, and/or steps to complete)

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

![](./img/tweety.jpg)
