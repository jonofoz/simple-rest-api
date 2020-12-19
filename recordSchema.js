require('dotenv').config()

const { Schema, model } = require('mongoose');

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

const {
    NODE_ENV,
    COLLECTION_NAME_TEST,
    COLLECTION_NAME_PRODUCTION
} = process.env;

const recordSchema = new Schema(
    {
        _id: { type: Schema.Types.ObjectId, required: false },
        timestamp: { type: Number, required: false },
        value1: { type: String, required: false },
        value2: { type: Number, required: false },
        value3: { type: Boolean, required: false },
        creationDate: { type: Number, required: false },
        lastModificationDate: { type: Number, required: false },
    },
    {
        versionKey: false,
        collection: NODE_ENV === 'test' ? COLLECTION_NAME_TEST : COLLECTION_NAME_PRODUCTION
    }
);

module.exports = model("Record", recordSchema);