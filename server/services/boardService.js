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

module.exports = {
  getBoardList: async (subject, page) => {
    try {
      return await db
        .collection('board_list')
        .find({ subject: subject })
        .skip((page - 1) * 5)
        .limit(5)
        .toArray();
    } catch (e) {
      throw e;
    }
  },
};
