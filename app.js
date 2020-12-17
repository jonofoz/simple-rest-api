require('dotenv').config()

const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json());
app.use(require("cors")({optionsSuccessStatus: 200}));
app.set('port', process.env.PORT || 5000);


// Connect to MongoDB
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
var collection;
MongoClient.connect(URI, { useUnifiedTopology: true }, (err, client) => {
    if (err) {
        throw err;
    }
    collection = client.db('default').collection('starterData');
})

app.use((req, res, next) => {
    // Give the APIRouter middleware (directly below) access to the collection
    req.collection = collection;
    next();
})

app.use('/api', require('./routes/api'));

app.listen(app.get('port'), () => {
    console.log(`App listening on port ${app.get('port')}!`)
});