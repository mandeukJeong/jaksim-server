require('dotenv').config();
const { PORT } = process.env;

const express = require('express');
const app = express();

app.listen(PORT, () => {
    console.log(`App listening at http://localhost:${PORT}`)
})