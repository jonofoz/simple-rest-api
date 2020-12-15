const express = require('express');
const app = express();
const router = express.Router()

const PORT = process.env.PORT      || 5000;

app.use(express.json());

router.get('/list', async (req, res) => {
    // TODO: DB
    const records = [];
    const numberOfRecords = records.length
    res.json({ message: `${numberOfRecords} records fetched successfully.`, records });
})
router.post('/create', async (req, res) => {
    // TODO: DB
    const record = req.body;
    // Node's default response.statusCode is 200, so we specify others like 201 as needed.
    res.status(201).json({ message: `Record created successfully.`, record });
})
router.get('/read/:recordId', async (req, res) => {
    // TODO: DB
    const recordId = req.params.recordId;
    const record = {};
    res.json({ message: `Record ${recordId} fetched successfully.`, record });
})
router.put('/modify/:recordId', async (req, res) => {
    // TODO: DB
    const recordId = req.params.recordId;
    const record = {};
    res.json({ message: `Record ${recordId} updated successfully.`, record });
})
router.delete('/remove/:recordId', async (req, res) => {
    // TODO: DB
    const recordId = req.params.recordId;
    const record = {};
    res.json({ message: `Record ${recordId} deleted successfully.`, record });
})

app.use('/api', router);

app.listen(PORT);