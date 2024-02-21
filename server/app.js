require('dotenv').config();
const { PORT } = process.env;

const express = require('express');
const app = express();
const connectDB = require('./db/connect.js');

let db;
connectDB.then((client) => {
    console.log("MongoDB 연결 성공");
    db = client.db("jaksim");
    app.listen(PORT, () => {
        console.log(`App listening at http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.log(error);
});

