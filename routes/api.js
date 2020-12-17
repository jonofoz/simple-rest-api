const express = require('express');
const { ObjectID } = require('mongodb');
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

// Swagger - documentation setup
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "A Simple REST API",
        description: "This is a simple REST API!",
        version: "3.0.0"
        },
        externalDocs: {
            description: "Documentation built with Swagger.",
            url: "http://swagger.io"
        },
        // TODO: Determine which servers are available to execute API calls on, depending on where the documentation is hosted.
      servers: [
        { url: "http://localhost:5000/" },
        { url: "https://simple-rest-api-jonofoz.herokuapp.com/" },
        { url: "http://simple-rest-api-jonofoz.herokuapp.com/" }
      ],
    },
    apis: ["./routes/api.js"],
};

const specs = swaggerJsdoc(options);
APIrouter.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

// Swagger - components setup

/**
 * @swagger
 * components:
 *   schemas:
 *     Record:
 *       type: object
 *       properties:
 *         _id:
 *           description: The 12 byte, hexademical representation of an automatically-generated MongoDB ObjectId
 *           type: string
 *           format: byte
 *           example: '999999999999999999999999'
 *         timestamp:
 *           description: The unix time, in milliseconds, that the record was created
 *           type: integer
 *           example: 1578031200000
 *         value1:
 *           description: A string (does not have to be a name)
 *           type: string
 *           example: Lowe Pannaman
 *         value2:
 *           type: number
 *           format: float
 *           example: 46.3
 *         value3:
 *           type: boolean
 *           example: false
 *         creationDate:
 *           description: The unix timestamp, in milliseconds, that the record was first saved to the database
 *           type: integer
 *           example: 1608239798195
 *         lastModificationDate:
 *           description: The unix timestamp, in milliseconds, of the last time the record was modified
 *           type: integer
 *           example: 1608239798195
 */

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
        const allRecords = await req.collection.find({}).toArray();
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
        const record = await req.collection.findOne({ _id: ObjectID(recordId) });
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
        const record = req.body;
        // Users should not directly supply the record's _id field
        if (record._id !== undefined) {
            throw new Error(errorMessages['ID_WAS_SUPPLIED']);
        }
        record.lastModificationDate = record.creationDate = new Date().getTime();
        await req.collection.insertOne(record);
        console.log('Record created successfully.');
        res.status(201).json(record);
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
        const record = await req.collection.findOneAndUpdate(
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
        const deletedRecord = await req.collection.findOneAndDelete({ _id: ObjectID(recordId) }).then((result) => result.value);
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
    res.status(status).send({ err: err.message });
    next();
})

module.exports = APIrouter;
