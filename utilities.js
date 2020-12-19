
const  mongoose = require('mongoose');

const Record = require('./recordSchema');
const starterData = require('./starterData');

async function clearDBData(URI, dbName, collectionName) {
    try {
        await mongoose.connect(`${URI}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        mongoose.connection.db.dropDatabase()
    }
    catch (err) {
        throw new Error(err);
    }
    finally {
        mongoose.connection.close()
    }
}

async function populateDBWithStarterData(URI, dbName, collectionName) {
    try {
        await mongoose.connect(`${URI}/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        // First, remove everything from the database
        mongoose.connection.db.dropDatabase()
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
        mongoose.connection.close()
    }
}

module.exports = {
    populateDBWithStarterData,
    clearDBData
}