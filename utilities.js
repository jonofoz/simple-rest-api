
require('dotenv').config();
const mongoose = require('mongoose');

const Record = require('./recordSchema');
const starterData = require('./starterData');

const testing = process.env.NODE_ENV === "test";

async function clearDBData(URI, dbName, collectionName) {
    try {
        if (!testing) {
            await mongoose.connect(`${URI}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        }
        await Record.deleteMany({});
    }
    catch (err) {
        throw new Error(err);
    }
    finally {
        if (!testing) {
            mongoose.connection.close()
        }
    }
}

async function populateDBWithStarterData(URI, dbName, collectionName) {
    try {
        if (!testing) {
            await mongoose.connect(`${URI}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        }
        // First, remove everything from the database
        await Record.deleteMany({});
        // Populate the collection with the starterData
        for await (var record of starterData) {
            try {
                record.lastModificationDate = record.creationDate = new Date().getTime();
                const newRecord = Record(record)
                await newRecord.save()
                console.log('Record created successfully.');
            }
            catch (err) {
                console.log(err)
            }
        };
    }
    catch (err) {
        throw new Error(err);
    }
    finally {
        if (!testing) {
            mongoose.connection.close()
        }
    }
}

module.exports = {
    populateDBWithStarterData,
    clearDBData
}