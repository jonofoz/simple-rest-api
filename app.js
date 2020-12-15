const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const router = express.Router()

const PORT = process.env.PORT      || 5000;
const URI  = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';

const client = MongoClient(URI, {useUnifiedTopology: true});
app.use(express.json());

(async () => await client.connect())();
const db = client.db('default');
const collection = db.collection('starterData');

router.get('/list', async (req, res) => {
    try {
        const allRecords = await collection.find({}).toArray()
        console.log(`${allRecords.length} records fetched successfully.`)
        res.json(allRecords);
    }
    catch (err) { res.send({message: `An error occurred: ${err.message}`}) }
})
router.post('/create', async (req, res) => {
    // TODO: DB
    const record = req.body;
    console.log('Record created successfully.')
    // Node's default response.statusCode is 200, so we specify others like 201 as needed.
    res.status(201).json(record);
})
router.get('/read/:recordId', async (req, res) => {
    // TODO: DB
    const recordId = req.params.recordId;
    const record = {};
    console.log(`Record ${recordId} fetched successfully.`)
    res.json(record);
})
router.put('/modify/:recordId', async (req, res) => {
    // TODO: DB
    const recordId = req.params.recordId;
    const record = {};
    console.log(`Record ${recordId} updated successfully.`)
    res.json(record);
})
router.delete('/remove/:recordId', async (req, res) => {
    // TODO: DB
    const recordId = req.params.recordId;
    const record = {};
    console.log(`Record ${recordId} deleted successfully.`)
    res.json(record);
})

app.use('/api', router);

app.listen(PORT);