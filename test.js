const { handler } = require('./');

const event = {
  id: 1,
  time: new Date(),
};

handler(event)
  .then(console.log)
  .catch(console.error);
