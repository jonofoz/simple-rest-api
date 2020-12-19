# tagup-rest-api [![Build Status](https://travis-ci.com/jonofoz/tagup-rest-api.svg?token=o3itZ4YG7Vp8DyLad8P4&branch=master)](https://travis-ci.com/jonofoz/tagup-rest-api)

### Note: this repo is private.

For convenience, the challenge docs can be found [here](https://github.com/tagup/challenges/tree/master/backend).

---

#### Questions So Far:

**First, basic questions.**
- Do new entries to the database require schema validation (i.e. making sure value1 *is* a string)?

**And then—with an understanding that this is just an exercise—questions about which database to choose.**
- Does the schema need to flexible to account for future changes, or is it fixed?
- Who is coming behind me to add onto my code, and what's their experience?
- Will complex queries be performed frequently on the data?
- How much larger will the data be in 5-10 years?

Defaulting to MongoDB or Firebase until proven less ideal (if I can get answers to the DB-specific questions).

### Endpoints:

Since all endpoints begin with `/api`, I can factor that out of the equation.

#### Testing:

In addition to the local DB, a small test DB should be created on the fly to prove the following tests:

1. "Should list all records in the database"
    - There are N records in total
    - The records are in a predictable order
2. "Should fetch a record from the database
    - The values of the record are as expected
3. "Should create a new record in the database"
    - There are N records before new record creation
    - There are N + 1 records after new record creation
    - The database doesn't contain the record before its creation
    - The database contains the record after its creation
    - The record is created and the status is 201
    - (If schema-validated) The new record will not be created if there is a schema mismatch and an error will be thrown
4. "Should update an existing record's values in the database"
    - The values of the record are as expected before modification
    - The values of the record are different after modification
    - There are N records in total before and after modification
5. "Should remove a record from the database"
    - There are N records before record deletion
    - There are N - 1 records after new record deletion
    - The database contains the record before its deletion
    - The database doesn't contain the record after its deletion
    - The record is deleted and the status is 200
