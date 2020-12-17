require('dotenv').config()
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const { MongoClient, ObjectID } = require('mongodb');
const app = express();
const router = express.Router();

const PORT = process.env.PORT      || 5000;
// MONGO_URI_DEFAULT typically expected to be mongodb://127.0.0.1:27017
const URI = process.env.MONGO_URI || process.env.MONGO_URI_DEFAULT;

const client = MongoClient(URI, {useUnifiedTopology: true});
app.use(express.json());
app.use(cors({optionsSuccessStatus: 200}));

var db, collection;

// Docs
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
        { url: "https://simple-rest-api-jonofoz.herokuapp.com/" },
        { url: "http://simple-rest-api-jonofoz.herokuapp.com/" },
        { url: "http://localhost:5000/" }
      ],
    },
    apis: ["./app.js"],
  };
const specs = swaggerJsdoc(options);
router.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);


/**
 * @swagger
 * components:
 *   schemas:
 *     Record:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The 12 byte, hexademical representation of a MongoDB ObjectId
 *           format: byte
 *           example: 5fdb9473354a9f3b6cf7cde
 *         timestamp:
 *           type: integer
 *           description: The unix time, in milliseconds, that the record was created
 *           example: 1578031200000
 *         value1:
 *           type: string
 *           example: Lowe Pannaman
 *         value2:
 *           type: number
 *           format: float
 *           example: 46.3
 *         value3:
 *           type: boolean
 *           example: false
 *         lastModificationDate:
 *           type: integer
 *           description: The unix timestamp, in milliseconds, of the last time the record was modified
 *           example: 1608225907502
 *         creationDate:
 *           type: integer
 *           description: The unix timestamp, in milliseconds, that the record was first saved to the database
 *           example: 1608225907502
 */

/**
 * @swagger
 * /api/list:
 *     get:
 *       tags:
 *       - API
 *       summary: Fetch all records from the database
 *       description: Record data will be returned as an array of JSON objects.
 *       operationId: getAllRecords
 *       responses:
 *         "200":
 *           description: All records fetched successfully
 */
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

/**
 * @swagger
 * /api/read/{recordId}:
 *   get:
 *     tags:
 *     - API
 *     summary: Fetch a record from the database
 *     description: Record will be returned as a JSON object. See example below.
 *     operationId: fetchRecord
 *     parameters:
 *     - name: recordId
 *       in: path
 *       description: The 12 byte, hexademical representation of a MongoDB ObjectId
 *       example: 5fdb9473354a9f3b6cf7cdee
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
 *         description: ID supplied was not valid
 *       "404":
 *         description: Record with that ID wasn't found
 */
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

/**
 * @swagger
 * /api/create:
 *   post:
 *     tags:
 *     - API
 *     summary: Add a new record to the database
 *     operationId: createRecord
 *     requestBody:
 *       description: Any combination of the fields in an existing record can be modified. If the field did not already exist in the record, it will be added.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Record'
 *     responses:
 *       "200":
 *         description: Record was created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       "400":
 *         description: ID supplied was not valid
 *       "404":
 *         description: Record with that ID wasn't found
 */
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

/**
 * @swagger
 * /api/modify/{recordId}:
 *   put:
 *     tags:
 *     - API
 *     summary: Update a record in the database
 *     operationId: updateRecord
 *     parameters:
 *     - name: recordId
 *       in: path
 *       description: The 12 byte, hexademical representation of a MongoDB ObjectId
 *       example: 5fdb9473354a9f3b6cf7cdee
 *       required: true
 *       schema:
 *         type: string
 *         format: byte
 *     requestBody:
 *       description: Any combination of the fields in an existing record can be modified. If the field did not already exist in the record, it will be added.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Record'
 *     responses:
 *       "200":
 *         description: Record was modified successfully and the new version was returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Record'
 *       "400":
 *         description: Supplied ID wasn't valid
 *       "404":
 *         description: No record with that ID was found
 */
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

/**
 * @swagger
 * /api/delete/{recordId}:
 *   delete:
 *     tags:
 *     - API
 *     summary: Delete record in the database
 *     operationId: deleteRecord
 *     parameters:
 *     - name: recordId
 *       in: path
 *       description: The 12 byte, hexademical representation of a MongoDB ObjectId
 *       example: 5fdb9473354a9f3b6cf7cdee
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
 *         description: ID supplied was not valid
 *       "404":
 *         description: Record with that ID wasn't found
 */
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