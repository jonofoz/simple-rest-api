require('dotenv').config()

const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json());
app.use(require("cors")({optionsSuccessStatus: 200}));

const testing = process.env.NODE_ENV === "test";
// Connect to MongoDB
const PORT = testing ? 3333 : process.env.PORT;
const DB_NAME         = testing ? process.env.DB_NAME_TEST         : process.env.DB_NAME_PRODUCTION;
const COLLECTION_NAME = testing ? process.env.COLLECTION_NAME_TEST : process.env.COLLECTION_NAME_PRODUCTION;
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';

app.set('port', PORT || 5000);

var collection;
const connection = MongoClient.connect(URI, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        throw err;
    }
    collection = client.db(DB_NAME).collection(COLLECTION_NAME);

})

app.use((req, res, next) => {
    // Give the APIRouter middleware (directly below) access to the collection
    req.collection = collection;
    next();
})

app.use('/api', require('./routes/api'));

/*
    SuperTest handles the opening and closing of a test instance of app.
    We don't call listen() manually in test: we could potentially create
    orphan processes if we don't close them before tests finish.
*/

if (!testing) {
    app.listen(app.get('port'), () => {
        console.log(`App listening on port ${app.get('port')}!`)
    });
}

module.exports = app;