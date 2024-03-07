const bcrypt = require('bcrypt');
const connectDB = require('../db/connect');
const mailer = require('../module/mail');
const { ObjectId } = require('mongodb');

let db;
connectDB
  .then((client) => {
    console.log('MongoDB 연결 성공');
    db = client.db('jaksim');
  })
  .catch((error) => {
    console.log(error);
  });

module.exports = {
  registerUser: async (userInfo) => {
    try {
      const isDuplicated = await db
        .collection('user')
        .findOne({ email: userInfo.email });
      if (isDuplicated) {
        const error = new Error('중복된 이메일이 존재합니다.');
        error.code = 400;
        throw error;
      } else {
        const hashPassword = await bcrypt.hash(userInfo.password, 10);
        return await db.collection('user').insertOne({
          email: userInfo.email,
          nickname: userInfo.nickname,
          password: hashPassword,
          eventCheck: userInfo.eventCheck,
          authId: 1,
        });
      }
    } catch (e) {
      throw e;
    }
  },

  sendEmail: async (emailInfo) => {
    try {
      const isUser = await db
        .collection('user')
        .findOne({ email: emailInfo.toEmail });
      if (!isUser) {
        const error = new Error('존재하지 않는 계정입니다.');
        error.code = 404;
        throw error;
      } else {
        return mailer.sendMail(emailInfo);
      }
    } catch (e) {
      throw e;
    }
  },

  changePassword: async (passwordInfo) => {
    try {
      const hashPassword = await bcrypt.hash(passwordInfo.password, 10);
      return await db.collection('user').updateOne(
        { email: passwordInfo.email },
        {
          $set: { password: hashPassword },
        }
      );
    } catch (e) {
      throw e;
    }
  },

  getUser: async (id) => {
    try {
      return await db.collection('user').findOne({ _id: new ObjectId(id) });
    } catch (e) {
      throw e;
    }
  },
};
