require('dotenv').config()
const { ObjectID } = require('mongodb');
const { MongoClient } = require('mongodb');

const starterData = require('./starterData');
// MONGO_URI_DEFAULT typically expected to be mongodb://127.0.0.1:27017
const URI = process.env.MONGO_URI || process.env.MONGO_URI_DEFAULT;

const client = MongoClient(URI, {useUnifiedTopology: true});

async function disconnectFromDB(exitStatus=null) {
    try {
        await client.close();
    }
    finally {
        if (exitStatus == 1) {
            process.exit(exitStatus);
        }
    }
}

/**
 * This function places  basic starter data into the database for the REST API to work with. (Generated with Mockaroo.)
 */
async function setupStarterData() {
    try {
        await client.connect();
        const db = client.db('default');
        const collection = db.collection('starterData')
        // Remove the starterData collection if it already exists
        await collection.deleteMany({})
        // Populate the collection with the starterData
        for await (let doc of starterData) {
            try {
                doc.creationDate = doc.lastModificationDate = new Date().getTime();
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
}

setupStarterData()
    .then(() => {
        console.log("Starter data successfully added to the database!")
    })
    .finally(() => disconnectFromDB())
    .catch(err => console.log(err.stack))