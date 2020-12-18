const { MongoClient } = require('mongodb');

const starterData = require('./starterData');

async function clearDBData(URI, dbName, collectionName) {
    const client = MongoClient(URI, {useUnifiedTopology: true});
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName)
        // Remove everything from the database
        await collection.deleteMany({})
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.close()
    }
}

async function populateDBWithStarterData(URI, dbName, collectionName) {
    const client = MongoClient(URI, {useUnifiedTopology: true});
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName)
        // Remove everything from the database
        await collection.deleteMany({})
        // Populate the collection with the starterData
        for await (var doc of starterData) {
            try {
                doc.lastModificationDate = doc.creationDate = new Date().getTime();
                await collection.insertOne(doc);
            }
            catch (err) {
                console.log(err)
            }
        };
    }
    catch (err) {
        console.log(err);
    }
    finally {
        client.close()
    }
}

module.exports = {
    populateDBWithStarterData,
    clearDBData
}