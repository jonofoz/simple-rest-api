
require('dotenv').config();
const mongoose = require('mongoose');

const Record = require('./recordSchema');
const starterData = require('./starterData');

// Jest automatically sets NODE_ENV=test: here, we check if Jest is running.
const testing = process.env.NODE_ENV === "test";

// Connects to DB (if not testing) and removes all records from a database collection.
async function removeRecords(URI, dbName) {
    if (!testing) await mongoose.connect(`${URI}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    await Record.deleteMany({});
}

// Disconnects from DB (if not testing).
async function closeConnection(URI, dbName) {
    if (!testing) await mongoose.connection.close()
}

async function clearRecordsInDB(URI, dbName) {
    try {
        await removeRecords(URI, dbName);
    }
    catch (err) {
        throw new Error(err);
    }
    finally {
        await closeConnection();
    }
}

async function populateDBWithStarterData(URI, dbName) {
    try {
        await removeRecords(URI, dbName);

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
        await closeConnection();
    }
}

module.exports = {
    populateDBWithStarterData,
    clearRecordsInDB
}