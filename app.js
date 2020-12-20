require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');

const app = express();

app.use(express.json());
app.use(require("cors")({optionsSuccessStatus: 200}));

// Jest automatically sets NODE_ENV=test: here, we check if Jest is running.
const testing = process.env.NODE_ENV === "test";
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'
const DB_NAME_TEST       = process.env.DB_NAME_TEST       || 'testDB';
const DB_NAME_PRODUCTION = process.env.DB_NAME_PRODUCTION || 'productionDB';
const DB = testing ? DB_NAME_TEST : DB_NAME_PRODUCTION;
app.set('port', testing ? 3333 : (process.env.PORT || 5000));

mongoose.connect(`${URI}/${DB}`, { useNewUrlParser: true , useUnifiedTopology: true,  useFindAndModify: false})

// Setup Swagger docs
const docsSpecs = require('./docsSpecs')(app.get('port'));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(docsSpecs));

// Setup API
app.use('/api', require('./routes/api'));

/*
    SuperTest handles the opening and closing of a test instance of the app,
    so listen() should not be called in that environment.
*/
if (!testing) {
    app.listen(app.get('port'), () => {
        console.log(`App listening on port ${app.get('port')}!`)
    });
}

module.exports = app;