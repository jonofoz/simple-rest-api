
require('dotenv').config();
const mongoose = require('mongoose');

const Record = require('./recordSchema');
const starterData = require('./starterData');

// Jest automatically sets NODE_ENV=test: here, we check if Jest is running.
const testing = process.env.NODE_ENV === "test";

// Connects to DB (if not testing) and removes all records from a database collection.
async function removeRecords(URI, dbName) {
    if (!testing) mongoose.connect(`${URI}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    await Record.deleteMany({});
}

// Disconnects from DB (if not testing).
function closeConnection(URI, dbName) {
    if (!testing) mongoose.connection.close()
}

async function clearRecordsInDB(URI, dbName) {
    try {
        removeRecords(URI, dbName);
    }
    catch (err) {
        throw new Error(err);
    }
    finally {
        closeConnection();
    }
}

async function populateDBWithStarterData(URI, dbName) {
    try {
        removeRecords(URI, dbName);

        for await (var record of starterData) {
            record.lastModificationDate = record.creationDate = new Date().getTime();
            const newRecord = Record(record)
            await newRecord.save()
            console.log('Record created successfully.');
        };
    }
    catch (err) {
        throw new Error(err);
    }
    finally {
        closeConnection();
    }
}

module.exports = {
    populateDBWithStarterData,
    clearRecordsInDB
}