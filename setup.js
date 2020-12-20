/*
    This is a little helper script that generates the data in ./starterData.js,
    either in the test database or in the production database.
*/

require('dotenv').config()
const { populateDBWithStarterData } = require('./dbUtils');

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
const DB_NAME_TEST       = process.env.DB_NAME_TEST       || 'testDB';
const DB_NAME_PRODUCTION = process.env.DB_NAME_PRODUCTION || 'productionDB';
const DB = testing ? DB_NAME_TEST : DB_NAME_PRODUCTION;
populateDBWithStarterData(URI, DB)
    .then(() => console.log(`Starter data successfully populated in ${DB}!`))
    .catch(err => console.log(err.stack))