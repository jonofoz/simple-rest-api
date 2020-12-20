require('dotenv').config()

const mongoose = require('mongoose');
// Swagger - documentation setup
const swaggerJsdoc = require('swagger-jsdoc');

const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017'

function getDocsSpecs(port) {
  // These are the available servers to run tests on.
  const servers = [
      { url: "https://simple-rest-api-jonofoz.herokuapp.com/" },
      { url: "http://simple-rest-api-jonofoz.herokuapp.com/" }
  ]
  /*
    In short, the below conditional checks if the user can run the REST API on a
    local MongoDB server from the SwaggerUI docs: if so, we add the local server
    as the first option in the array of servers.

    Conditions:
    - The MONGO_URI looks like it's meant to connect to a local server
    - The connection to server has succeeded or is still connecting
      (1 = connected, 2 = connecting)
  */
  if (URI.includes('127.0.0.1') && (0 < mongoose.connection.readyState < 3)) {
      servers.unshift({ url: `http://localhost:${port}/` })
  }

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
        servers
      },
      apis: ["./routes/api.js", "./recordSchema.js"],
  };

  const specs = swaggerJsdoc(options);
  return specs;
}

module.exports = getDocsSpecs;