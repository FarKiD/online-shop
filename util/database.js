/*

const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017";

const client = new MongoClient(url);

async function mongoConnect(callback = () => {}) {
   try {
        await client.connect();
        const _db = client.db('shop');
        callback(_db, client);
       } catch (err) {
        console.log(err.stack);
        throw err;
    } finally {
        () => client.close();
    }
};

module.exports = mongoConnect;

*/