/*
    This is a little helper script that generates the data in ./starterData.js,
    either in a test database or in the production database.
*/

require('dotenv').config()
const { populateDBWithStarterData } = require('./utilities');

const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'

// Check correct usage of this utility from a CLI
if (process.argv.length !== 3 || (process.argv[2] !== 'test' && process.argv[2] !== 'production')) {
    throw new Error(
        '\nIncorrect usage of "setupFor" to generate starterData.\n' +
        'Here\'s how to use it: ' +
        'npm run setupFor[test, production]"\n'
    )
}
const testing = process.argv[2] === 'test'
const DB_NAME         = testing ? process.env.DB_NAME_TEST         : process.env.DB_NAME_PRODUCTION;
const COLLECTION_NAME = testing ? process.env.COLLECTION_NAME_TEST : process.env.COLLECTION_NAME_PRODUCTION;

populateDBWithStarterData(URI, DB_NAME, COLLECTION_NAME)
    .then(() => console.log(`${COLLECTION_NAME} successfully populated in ${DB_NAME}!`))
    .catch(err => console.log(err.stack))