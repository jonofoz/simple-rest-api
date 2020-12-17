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

router.get('/list', async (req, res, next) => {
    try {
        const allRecords = await collection.find({}).toArray();
        console.log(`${allRecords.length} records fetched successfully.`);
        res.json(allRecords);
    }
    catch (err) {
        next(err);
    }
})
router.post('/create', async (req, res, next) => {
    try {
        const record = req.body;
        record.creationDate = record.lastModificationDate = new Date().getTime();
        await collection.insertOne(record);
        console.log('Record created successfully.');
        res.status(201).json(record);
    }
    catch (err) {
        next(err);
    }
})
router.get('/read/:recordId', async (req, res, next) => {
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
        next(err);
    }
})
router.put('/modify/:recordId', async (req, res, next) => {
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
        next(err);
    }
})
router.delete('/remove/:recordId', async (req, res, next) => {
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
        next(err);
    }
})

app.use('/api', router);

// Error handling middleware
app.use(async (err, req, res, next) => {

    // The errors thrown by the MongoDB wrapper do not appear to include status codes,
    // so we choose the appropriate ones here.
    var status = 500;
    const message = await err.message;
    if (message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
        status = 400;
    }
    else if (message.includes("No record with ID")) {
        status = 404;
    }
    res.status(status).send({ err: err.message });
    next();
})

app.listen(PORT, () => {
    MongoClient.connect(URI, { useUnifiedTopology: true }, (err, client) => {
        if (err) {
            throw err;
        }
        db = client.db('default');
        collection = db.collection('starterData');
    })
});