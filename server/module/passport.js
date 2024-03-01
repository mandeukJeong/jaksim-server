const bcrypt = require('bcrypt');
const connectDB = require('../db/connect');

let db;
connectDB
  .then((client) => {
    console.log('MongoDB 연결 성공');
    db = client.db('jaksim');
  })
  .catch((error) => {
    console.log(error);
  });

const cookieExtractor = (req) => {
  const { auth } = req.cookies;
  return auth;
};

const opts = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_REFRESH_KEY,
};

const passport = require('passport');
const {
  Strategy: JWTStrategy,
  ExtractJwt: ExtractJWT,
} = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;

module.exports = () => {
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        const user = await db.collection('user').findOne({ email: email });
        if (!user) {
          return done(null, false, { message: '존재하지 않는 계정입니다.' });
        }

        if (await bcrypt.compare(password, user.password)) {
          return done(null, user, { message: '로그인에 성공하였습니다.' });
        } else {
          return done(null, false, {
            message: '비밀번호가 일치하지 않습니다.',
          });
        }
      }
    )
  );

  passport.use(
    'jwt',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET_KEY,
      },
      async (jwtPayload, done) => {
        const user = await db
          .collection('user')
          .findOne({ email: jwtPayload.id });
        if (user) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: '올바르지 않은 인증 정보입니다.',
          });
        }
      }
    )
  );

  passport.use(
    'refresh',
    new JWTStrategy(opts, async (jwtPayload, done) => {
      const user = await db
        .collection('user')
        .findOne({ email: jwtPayload.id });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: '올바르지 않은 인증 정보입니다.',
        });
      }
    })
  );
};
