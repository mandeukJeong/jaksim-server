const { MongoClient } = require('mongodb');
const url = process.env.MONGO_URI;
const connectDB = new MongoClient(url).connect();

module.exports = connectDB;