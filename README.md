

tagup-rest-api [![Build Status](https://travis-ci.com/jonofoz/tagup-rest-api.svg?token=o3itZ4YG7Vp8DyLad8P4&branch=master)](https://travis-ci.com/jonofoz/tagup-rest-api)
==============

This is a simple REST API that performs basic CRUD operations on some fake data!

If you don't want to clone the project yet, you can play with [this deployed version first](https://simple-rest-api-jonofoz.herokuapp.com/api-docs/#/) and test the API there from the SwaggerUI docs. If you're confused as to how to test the app there, check out my [super quick (< 1 minute) guide](#link-to-guide) to dive in.



Before You Install
------------------
- You should have MongoDB installed locally; if you don't, download it [here.](https://www.mongodb.com/try/download/community) 
- The default URI for connecting to MongoDB with is `mongodb://127.0.0.1:27017`: if that's not the case for you, you will need to rename the `sample.env` file to `.env` after you've cloned to app, then fix the `MONGO_URI` variable to suit your needs.

Installation
------------
(I'll assume you already know how to use at least one CLI, like Bash, PowerShell, etc.)

1. Clone the app.
`git clone https://github.com/jonofoz/tagup-rest-api.git`
2. Change into the new `tagup-rest-api` directory.
3. Enter `npm install` and wait for the installation to complete.
4. Run the following command(s) to populate MongoDB with the starter data:
    - For production, `npm run setupFor production`.
    - For test, `npm run setupFor test`.
5. Enter `npm start`. 
    - The API should start on `http://localhost:5000`: if the 5000 port is already in use, kill the app, change the `PORT` variable in a `.env` file to a free port, then restart the app.
6. Navigate to `http://localhost:5000/api-docs`.
7. Have fun!

Again, if you need help with the SwaggerUI docs, [here's my quick guide](#link-to-guide).

Problems or Questions?
----------------------
Let me know!
jon@jonofoz.com

