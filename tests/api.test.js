require('dotenv').config()
const request = require('supertest');
const mongoose = require('mongoose');
const { Schema, model, Types: { ObjectId } } = mongoose;

const { populateDBWithStarterData, clearRecordsInDB } = require('../dbUtils');
const Record = require("../recordSchema");

const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'
const DB = process.env.DB_NAME_TEST || 'testDB';

var app;

beforeAll(async () => {
    const fullURI = `${URI}/${DB}`;
    await mongoose.connect(fullURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    mongoose.connection.on('connected', () => {
        console.log(`+ Connected to ${fullURI}`)
    })
    app = require('../app');
})

afterAll(async () => {
    await mongoose.connection.close()
    mongoose.connection.on('disconnected', () => {
        console.log(`- Disconnected from ${fullURI}`)
    })
})

beforeEach(async () => {
    console.log("--> NEW TEST")
    await populateDBWithStarterData(URI, DB)
        .then(() => console.log("Test data successfully added to the database!"))
        .catch(err => console.log(err.stack))
})
afterEach(async () => {
    await clearRecordsInDB(URI, DB)
        .then(() => console.log("Test data successfully cleared from the database!"))
        .catch(err => console.log(err.stack))
})

// This helper function pings the API for the current number of records in a database's collection.
async function getNumberOfRecords() {
    return await request(app)
        .get('/api/recordsCount')
        .expect(200)
        .then(res => res.body);
}

// This helper function just prints the name of the Jest test being run.
// Since the tests are currently run silently, this is only for debugging.
function consoleLogCurrentTestName(expect) {
    console.log(`--> '${expect.getState().currentTestName}'`)
}

describe('GET /', () => {
    test('Should list all records in the database', async () => {
        // There should 10 records returned
        consoleLogCurrentTestName(expect);
        expect.assertions(1);
        const records = await request(app)
            .get('/api/list')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => res.body);
        expect(records.length).toBe(10);
    })

    test('Should fetch a record from the database', async () => {
        // Should get Lowe Pannaman and any expected values
        consoleLogCurrentTestName(expect);
        expect.assertions(4);
        const record = await request(app)
            .get('/api/read/999999999999999999999999')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => res.body);
        expect(record.timestamp).toEqual(1578031200000);
        expect(record.value1).toEqual('Lowe Pannaman');
        expect(record.value2).toEqual(46.3);
        expect(record.value3).toEqual(false);
    })

    test('Should return 404 when a record isn\'t found', async () => {
        // Should get Lowe Pannaman and any expected values
        consoleLogCurrentTestName(expect);
        expect.assertions(1);
        const error = await request(app)
            .get('/api/read/ad38bcc792bccc4ab5e2464a')
            .expect(404)
            .expect('Content-Type', /json/)
            .then(res => res.body.error)
        expect(error).toEqual('No record with ID ad38bcc792bccc4ab5e2464a was found.');
    })

    test('Should fetch the number of records in the database', async () => {
        // Should return 10
        consoleLogCurrentTestName(expect);
        expect.assertions(1);
        expect(await getNumberOfRecords()).toEqual(10);
    })
})

describe('POST /', () => {
    test('Should create a new record in the database', async () => {
        /*
            Before creation:
                There should be 10 records

            After creation:
                Record should have any expected values
                There should be 11 records
                Record should not have been in the database before creation
        */
        consoleLogCurrentTestName(expect);
        expect.assertions(7);

        // Before creation:
        const recordsOld = await request(app)
            .get('/api/list')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => res.body);
        const recordsOldLength = recordsOld.length;
        expect(recordsOldLength).toEqual(10);

        // On creation:
        const requestBody = {
            'timestamp': 707,
            'value1': 'Test McGee',
            'value2': 5.5,
            'value3': true
        };
        const newRecord = await request(app)
            .post('/api/create')
            .send(requestBody)
            .set('Accept', 'application/json')
            .expect(201)
            .expect('Content-Type', /json/)
            .then(res => res.body)

        // After creation:
        expect(newRecord.timestamp).toEqual(requestBody['timestamp']);
        expect(newRecord.value1).toEqual(requestBody['value1']);
        expect(newRecord.value2).toEqual(requestBody['value2']);
        expect(newRecord.value3).toEqual(requestBody['value3']);

        // There should be one more record now
        expect(await getNumberOfRecords()).toEqual(recordsOldLength + 1);
        // Here we check if, for whatever reason, the new record was already there
        const newRecordWasAlreadyThere = recordsOld.filter(rec => rec._id === newRecord._id).length > 0;
        expect(newRecordWasAlreadyThere).toBeFalsy();
    })

    test('Should return 400 when _id is supplied', async () => {
        consoleLogCurrentTestName(expect);
        expect.assertions(1);

        const error = await request(app)
            .post('/api/create')
            .send({'_id': '111111111111111111'})
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .then(res => res.body.error);
        expect(error).toEqual('Supplying the _id field is not allowed');
    })
})

describe('PUT /', () => {
    test('Should modify a record in the database', async () => {
        /*
            Before modification:
                Record should have any expected values
                There should be 10 records

            After modification:
                Record should have any expected values
                There should still be 10 records
        */
        consoleLogCurrentTestName(expect);
        expect.assertions(10);

        // Before modification:

        // Let's modify Lowe Pannaman
        const record = await request(app)
            .get('/api/read/999999999999999999999999')
            .expect(200)
            .then(res => res.body);
        expect(record.timestamp).toEqual(1578031200000);
        expect(record.value1).toEqual('Lowe Pannaman');
        expect(record.value2).toEqual(46.3);
        expect(record.value3).toEqual(false);

        expect(await getNumberOfRecords()).toEqual(10);

        // On modification:
        const requestBody = {
            'timestamp': 1000,
            'value1': 'Lower Panama',
            'value2': 10.10,
            'value3': true
        };
        const modifiedRecord = await request(app)
            .put('/api/modify/999999999999999999999999')
            .send(requestBody)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then(res => res.body)

        // After modification:
        expect(modifiedRecord.timestamp).toEqual(requestBody['timestamp']);
        expect(modifiedRecord.value1).toEqual(requestBody['value1']);
        expect(modifiedRecord.value2).toEqual(requestBody['value2']);
        expect(modifiedRecord.value3).toEqual(requestBody['value3']);

        expect(await getNumberOfRecords()).toEqual(10);
    })

    test('Should return 400 when _id is supplied', async () => {
        consoleLogCurrentTestName(expect);
        expect.assertions(1);

        const error = await request(app)
            .post('/api/create')
            .send({'_id': '111111111111111111'})
            .set('Accept', 'application/json')
            .expect(400)
            .expect('Content-Type', /json/)
            .then(res => res.body.error);
        expect(error).toEqual('Supplying the _id field is not allowed');
    })
})

describe('DELETE /', () => {
    test('Should remove a record from the database', async () => {
        /*
            Before removal:
                There should be 10 records

            After removal:
                Record should have any expected values
                There should be 9 records
                Record should not be in the database after removal
        */
        consoleLogCurrentTestName(expect);
        expect.assertions(7);

        // Before removal:
        const numberOfRecordsOld = await getNumberOfRecords();
        expect(numberOfRecordsOld).toEqual(10);

        // On removal:
        // Sorry Lowe, you gotta go
        const deletedRecord = await request(app)
            .delete('/api/remove/999999999999999999999999')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(res => res.body)

        // After removal:
        expect(deletedRecord.timestamp).toEqual(1578031200000);
        expect(deletedRecord.value1).toEqual('Lowe Pannaman');
        expect(deletedRecord.value2).toEqual(46.3);
        expect(deletedRecord.value3).toEqual(false);
        // There should be one less record now
        const recordsNew = await request(app)
        .get('/api/list')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => res.body);
        expect(recordsNew.length).toEqual(numberOfRecordsOld - 1);

        // Here we check if, for whatever reason, the deleted record is still there
        const deletedRecordIstStillThere = recordsNew.filter(rec => rec._id === deletedRecord._id).length > 0;
        expect(deletedRecordIstStillThere).toBeFalsy();
    })
})
