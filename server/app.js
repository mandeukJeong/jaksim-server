require('dotenv').config();
const { PORT } = process.env;

const express = require('express');
const app = express();
const connectDB = require('./db/connect.js');
const methodOverride = require('method-override');
const passport = require('passport');
const passportConfig = require('./module/passport.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'front/build')));
passportConfig();

let db;
connectDB
  .then((client) => {
    console.log('MongoDB 연결 성공');
    db = client.db('jaksim');
    app.listen(PORT, () => {
      console.log(`App listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.use('/user', require('./routes/userRoute.js'));
app.use(
  '/board',
  passport.authenticate('jwt', { session: false }),
  require('./routes/boardRoute.js')
);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/front/build/index.html'));
});
