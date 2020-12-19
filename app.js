require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json());
app.use(require("cors")({optionsSuccessStatus: 200}));


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
    apis: ["./routes/api.js", "./recordSchema.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const testing = process.env.NODE_ENV === "test";
// Connect to MongoDB
const PORT = testing ? 3333 : process.env.PORT;
const DB_NAME         = testing ? process.env.DB_NAME_TEST         : process.env.DB_NAME_PRODUCTION;
const COLLECTION_NAME = testing ? process.env.COLLECTION_NAME_TEST : process.env.COLLECTION_NAME_PRODUCTION;
const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';

app.set('port', PORT || 5000);

mongoose.connect(`${URI}/${DB_NAME}`, { useNewUrlParser: true , useUnifiedTopology: true,  useFindAndModify: false})

app.use('/api', require('./routes/api'));

/*
    SuperTest handles the opening and closing of a test instance of app,
    so we don't call listen() in that case.
*/

if (!testing) {
    app.listen(app.get('port'), () => {
        console.log(`App listening on port ${app.get('port')}!`)
    });
}

module.exports = app;