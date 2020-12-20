const express = require('express');
const { Schema, model, Types: {ObjectId} } = require('mongoose');
const Record = require("../recordSchema");

const APIrouter = express.Router();

// Error messages: some custom, some from MongoDB
const errorMessages = {
    // 400
    ID_WAS_SUPPLIED: 'Supplying the _id field is not allowed',
    MONGO_ID_INVALID: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters',
    MONGO_ID_MODIFICATION_ATTEMPT: 'Performing an update on the path \'_id\' would modify the immutable field \'_id\'',
    // 404
    MONGO_ID_NOT_FOUND: 'No record with ID'
}
/**
 * @swagger
 * /api/list:
 *     get:
 *       tags:
 *       - API
 *       summary: Fetch all records from the database
 *       description: Record data will be returned as an array of JSON objects.
 *       responses:
 *         "200":
 *           description: All records fetched successfully
 */
APIrouter.get('/list', async (req, res, next) => {
    try {
        const allRecords = await Record.find({})
        console.log(`${allRecords.length} records fetched successfully.`);
        res.json(allRecords);
    }
    catch (err) {
        next(err);
    }
})

/**
 * @swagger
 * /api/read/{recordId}:
 *   get:
 *     tags:
 *     - API
 *     summary: Fetch a record from the database
 *     description: Record will be returned as a JSON object. See example below.
 *     parameters:
 *     - name: recordId
 *       in: path
 *       description: The 12 byte, hexademical representation of a MongoDB ObjectId
 *       example: '999999999999999999999999'
 *       required: true
 *       schema:
 *         type: string
 *         format: byte
 *     responses:
 *       "200":
 *         description: Record was fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       "400":
 *         description: ID supplied to URI path wasn't valid
 *       "404":
 *         description: No record with that ID was found
 */
APIrouter.get('/read/:recordId', async (req, res, next) => {
    try {
        const recordId = req.params.recordId;
        const record = await Record.findOne({ _id: ObjectId(recordId) });
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

/**
 * @swagger
 * /api/recordsCount:
 *     get:
 *       tags:
 *       - API
 *       summary: Returns the number of records in the database
 *       responses:
 *         "200":
 *           description: The number records of records was returned successfully
 */
APIrouter.get('/recordsCount', async (req, res, next) => {
    try {
        const recordsCount = await Record.countDocuments();
        console.log(`Current records count: ${recordsCount}`);
        res.json(recordsCount);
    }
    catch (err) {
        next(err);
    }
})

/**
 * @swagger
 * /api/create:
 *   post:
 *     tags:
 *     - API
 *     summary: Add a new record to the database
 *     requestBody:
 *       description: Any combination of the fields—except for `_id`—can be specified. If the field did not already exist in the record, it will be added.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Record'
 *           example:
 *             timestamp: 1500434700000
 *             value1: "Vashti Bunyan"
 *             value2: 26.4
 *             value3: true
 *     responses:
 *       "201":
 *         description: Record was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       "400":
 *         description: ID supplied to URI path wasn't valid, or the user tried to supply `_id` in the body
 *       "404":
 *         description: No record with that ID was found
 */
APIrouter.post('/create', async (req, res, next) => {
    try {
        var requestBody = req.body;
        // Users should not directly supply the record's _id field
        if (requestBody._id !== undefined) {
            throw new Error(errorMessages['ID_WAS_SUPPLIED']);
        }
        requestBody._id = new ObjectId();
        requestBody.lastModificationDate = requestBody.creationDate = new Date().getTime();
        const newRecord = Record(requestBody)
        newRecord.save()
        console.log('Record created successfully.');
        res.status(201).json(newRecord);
    }
    catch (err) {
        next(err);
    }
})

/**
 * @swagger
 * /api/modify/{recordId}:
 *   put:
 *     tags:
 *     - API
 *     summary: Update a record in the database
 *     parameters:
 *     - name: recordId
 *       in: path
 *       description: The 12 byte, hexademical representation of a MongoDB ObjectId
 *       example: '777777777777777777777777'
 *       required: true
 *       schema:
 *         type: string
 *         format: byte
 *     requestBody:
 *       description: Any combination of the fields—except for `_id`—in an existing record can be modified. If the field did not already exist in the record, it will be added.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Record'
 *           example:
 *             value1: "J. R. R. Tolkien"
 *             value2: 33.333
 *             value3: true
 *     responses:
 *       "200":
 *         description: Record was modified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       "400":
 *         description: ID supplied to URI path wasn't valid, or the user tried to manipulate `_id` in the body
 *       "404":
 *         description: No record with that ID was found
 */
APIrouter.put('/modify/:recordId', async (req, res, next) => {
    try {
        const recordId = req.params.recordId;
        const fieldsToUpdate = req.body;
        fieldsToUpdate.lastModificationDate = new Date().getTime();
        const recordToModify = await Record.findByIdAndUpdate(
            recordId,
            fieldsToUpdate,
            {new: true}
        )
        recordToModify.save()
        if (recordToModify == null) {
            throw new Error(`No record with ID ${recordId} was found.`);
        }
        console.log(`Record ${recordId} updated successfully.`);
        res.json(recordToModify);
    }
    catch (err) {
        next(err);
    }
})

/**
 * @swagger
 * /api/remove/{recordId}:
 *   delete:
 *     tags:
 *     - API
 *     summary: Delete record in the database
 *     parameters:
 *     - name: recordId
 *       in: path
 *       description: The 12 byte, hexademical representation of a MongoDB ObjectId
 *       example: '555555555555555555555555'
 *       required: true
 *       schema:
 *         type: string
 *         format: byte
 *     responses:
 *       "200":
 *         description: Record was deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       "400":
 *         description: ID supplied to URI path wasn't valid
 *       "404":
 *         description: No record with that ID was found
 */
APIrouter.delete('/remove/:recordId', async (req, res, next) => {
    try {
        const recordId = req.params.recordId;
        const deletedRecord = await Record.findByIdAndDelete(recordId);
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


// Error handling middleware
APIrouter.use((err, req, res, next) => {

    // The errors thrown by the MongoDB wrapper do not appear to include status codes.
    // Choose and send the appropriate code here, plus the included error message.
    const message = err.message;

    var status = 500;
    if (message.includes(errorMessages['ID_WAS_SUPPLIED']) ||
        message.includes(errorMessages['MONGO_ID_INVALID']) ||
        message.includes(errorMessages['MONGO_ID_MODIFICATION_ATTEMPT'])) {
        status = 400;
    }
    else if (message.includes(errorMessages['MONGO_ID_NOT_FOUND'])) {
        status = 404;
    }
    res.status(status).send(err.message);
    next();
})

module.exports = APIrouter;
