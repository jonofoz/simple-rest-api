/*
  Please note: the _id fields are not allowed to be set via the API.
  These _id's are assigned only as a convenience for testing, and these
  records are not inserted in ./setup.js via the API.
*/

const { ObjectID } = require("mongodb");

module.exports = [{
    "_id": ObjectID('111111111111111111111111'),
    "timestamp": 1585717200000,
    "value1": "Garek Dadge",
    "value2": 82.6,
    "value3": false
  }, {
    "_id": ObjectID('222222222222222222222222'),
    "timestamp": 1591851600000,
    "value1": "Onfre Fynn",
    "value2": 21.7,
    "value3": true
  }, {
    "_id": ObjectID('333333333333333333333333'),
    "timestamp": 1605852000000,
    "value1": "Daren Shillam",
    "value2": 62.1,
    "value3": true
  }, {
    "_id": ObjectID('444444444444444444444444'),
    "timestamp": 1602133200000,
    "value1": "Farra Sayburn",
    "value2": 96.2,
    "value3": false
  }, {
    "_id": ObjectID('555555555555555555555555'),
    "timestamp": 1593666000000,
    "value1": "Arni Versey",
    "value2": 76.8,
    "value3": true
  }, {
    "_id": ObjectID('666666666666666666666666'),
    "timestamp": 1577944800000,
    "value1": "Conchita Dawtry",
    "value2": 27.2,
    "value3": true
  }, {
    "_id": ObjectID('777777777777777777777777'),
    "timestamp": 1599022800000,
    "value1": "Lelah Drew-Clifton",
    "value2": 87.5,
    "value3": false
  }, {
    "_id": ObjectID('888888888888888888888888'),
    "timestamp": 1603688400000,
    "value1": "Read Faulkes",
    "value2": 23.0,
    "value3": false
  }, {
    "_id": ObjectID('999999999999999999999999'),
    "timestamp": 1578031200000,
    "value1": "Lowe Pannaman",
    "value2": 46.3,
    "value3": false
  }, {
    "_id": ObjectID('AAAAAAAAAAAAAAAAAAAAAAAA'),
    "timestamp": 1600232400000,
    "value1": "Tamarah Winny",
    "value2": 7.2,
    "value3": false
  }]