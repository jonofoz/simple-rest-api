require('dotenv').config()
const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');
const app = express();
const router = express.Router();

const PORT = process.env.PORT      || 5000;
// MONGO_URI_DEFAULT typically expected to be mongodb://127.0.0.1:27017
const URI = process.env.MONGO_URI || process.env.MONGO_URI_DEFAULT;

const client = MongoClient(URI, {useUnifiedTopology: true});
app.use(express.json());

var db, collection;

router.get('/list', async (req, res) => {
    try {
        const allRecords = await collection.find({}).toArray();
        console.log(`${allRecords.length} records fetched successfully.`);
        res.json(allRecords);
    }
    catch (err) {
        res.send({ error: err.message });
    }
})
router.post('/create', async (req, res) => {
    try {
        const record = req.body;
        record.creationDate = record.lastModificationDate = new Date().getTime();
        await collection.insertOne(record);
        console.log('Record created successfully.');
        res.status(201).json(record);
    }
    catch (err) {
        res.send({ error: err.message })
    }
})
router.get('/read/:recordId', async (req, res) => {
    try {
        const recordId = req.params.recordId;
        const record = await collection.findOne({ _id: ObjectID(recordId) });
        if (record == null) {
            throw new Error(`No record with ID ${recordId} was found.`);
        }
        console.log(`Record ${recordId} fetched successfully.`);
        res.json(record);
    }
    catch (err) {
        res.send({ error: err.message });
    }
})
router.put('/modify/:recordId', async (req, res) => {
    try {
        const recordId = req.params.recordId;
        const fieldsToUpdate = req.body;
        fieldsToUpdate.lastModificationDate = new Date().getTime();
        const record = await collection.findOneAndUpdate(
            { _id: ObjectID(recordId) },
            { $set: fieldsToUpdate },
            { returnOriginal: false }
        ).then(result => result.value)
        if (record == null) {
            throw new Error(`No record with ID ${recordId} was found.`);
        }
        console.log(`Record ${recordId} updated successfully.`);
        res.json(record);
    }
    catch (err) {
        res.send({ error: err.message });
    }
})
router.delete('/remove/:recordId', async (req, res) => {
    try {
        const recordId = req.params.recordId;
        const deletedRecord = await collection.findOneAndDelete({ _id: ObjectID(recordId) }).then((result) => result.value);
        if (deletedRecord == null) {
            throw new Error(`No record with ID ${recordId} was found.`);
        }
        console.log(`Record deleted successfully. (ID: ${recordId})`);
        res.json(deletedRecord);
    }
    catch (err) {
        res.send({ error: err.message });
    }
})

app.use('/api', router);

app.listen(PORT, () => {
    MongoClient.connect(URI, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            throw err;
        }
        db = client.db('default');
        collection = db.collection('starterData');
    })
});