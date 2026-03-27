const logger = require('../../logger');


// If the environment sets an AWS Region, we'll use AWS storage
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.
// Warn the user in case this wasn't intentional.
const { AWS_REGION } = process.env;

console.log('DATA BACKEND CHECK');
console.log('AWS_REGION =', process.env.AWS_REGION);
console.log('Using backend =', AWS_REGION ? 'aws' : 'memory');

if (!AWS_REGION) {
  logger.warn('No AWS_REGION environment variable set. Using MemoryDB vs. AWS storage');
}
module.exports = AWS_REGION ? require('./aws') : require('./memory');
