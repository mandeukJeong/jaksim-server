const userService = require('../services/userService');
const passport = require('passport');
const jwt = require('jsonwebtoken');

module.exports = {
  registerUser: async (req, res) => {
    // email, nickname, password 미입력, 이용약관 동의 체크 x
    if (!req.body.email || !req.body.nickname || !req.body.password) {
      return res.status(400).json({
        message:
          'Invalid request body. Must include email, nickname and password',
      });
    } else if (
      !req.body.serviceCheck ||
      !req.body.personalCheck ||
      req.body.eventCheck === undefined
    ) {
      return res.status(400).json({
        message:
          'Invalid request body. Must check serviceCheck, personalCheck and eventCheck',
      });
    }
    try {
      const newUser = await userService.registerUser(req.body);
      return res.status(201).json(newUser);
    } catch (e) {
      // 중복된 이메일로 회원가입 요청 시
      if (e.code === 400) {
        return res.status(e.code).json({ error: e.message });
      } else {
        return res.status(500).json({ error: e.message });
      }
    }
  },

  loginUser: async (req, res, next) => {
    try {
      passport.authenticate('local', (error, user, info) => {
        if (error) {
          return res.status(500).json(error);
        }
        if (!user) {
          return res.status(401).json(info.message);
        }
        req.login(user, { session: false }, (err) => {
          if (err) {
            return res.send(err);
          }
          const accessToken = jwt.sign(
            { id: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
          );
          const refreshToken = jwt.sign(
            { id: user.email },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '12h' }
          );
          res.cookie('user', user._id, {
            maxAge: 1000 * 60 * 60,
          });
          res.cookie('auth', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            // https로 배포했을 경우 적용
            // secure: true
          });
          res.status(200).json({ accessToken });
        });
      })(req, res, next);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  sendEmail: async (req, res) => {
    try {
      const { email } = req.body;
      const verifyNumber = Math.random().toString().substring(2, 6);
      res.cookie('verify', verifyNumber, {
        maxAge: 1000 * 60 * 5,
        httpOnly: true,
      });
      // 비밀번호 변경 시 사용자 정보 쿠키에 저장: 만료시간 10분
      res.cookie('email', email, {
        maxAge: 1000 * 60 * 10,
        httpOnly: true,
      });
      const emailInfo = {
        toEmail: email,
        subject: '작심하루 이메일 인증번호 발송 메일입니다.',
        text: `${email}님 안녕하세요!\n\n 인증번호: ${verifyNumber}\n\n 인증번호를 화면에 입력해주세요!`,
      };
      await userService.sendEmail(emailInfo);
      res.status(200).send('이메일 전송 성공');
    } catch (e) {
      // 존재하지 않는 이메일일 경우
      if (e.code === 404) {
        return res.status(e.code).json({ error: e.message });
      } else {
        return res.status(500).json({ error: e.message });
      }
    }
  },

  checkAuth: async (req, res) => {
    try {
      const userVerifyNum = req.body.verifyNumber;
      const cookieVerifyNum = req.cookies.verify;

      if (userVerifyNum === cookieVerifyNum) {
        return res.status(200).json({ message: '인증번호가 일치합니다.' });
      } else {
        return res
          .status(401)
          .json({ message: '인증번호가 일치하지 않습니다.' });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      if (!req.body.password) {
        return res.status(400).json({ message: '비밀번호 미입력' });
      } else if (!req.cookies.email) {
        return res.status(400).json({ message: '비밀번호 변경 시간 만료' });
      } else {
        const passwordInfo = {
          password: req.body.password,
          email: req.cookies.email,
        };
        await userService.changePassword(passwordInfo);
        return res.status(200).json({ message: '비밀번호 변경 성공' });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await userService.getUser(req.cookies.user);
      return res.status(200).json({
        data: {
          email: user.email,
          nickname: user.nickname,
          eventCheck: user.eventCheck,
        },
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  refreshUser: async (req, res) => {
    try {
      passport.authenticate('refresh', (error, user, info) => {
        if (error) {
          return res.status(500).json(error);
        }
        if (!user) {
          return res.status(401).json(info.message);
        }
        req.login(user, { session: false }, (err) => {
          if (err) {
            return res.send(err);
          }
          const accessToken = jwt.sign(
            { id: user.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
          );
          const refreshToken = jwt.sign(
            { id: user.email },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: '12h' }
          );
          res.cookie('user', user._id, {
            maxAge: 1000 * 60 * 60,
          });
          res.cookie('auth', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            // https로 배포했을 경우 적용
            // secure: true
          });
          res.status(200).json({ accessToken });
        });
      })(req, res);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },
};
