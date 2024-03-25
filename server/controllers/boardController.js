const boardService = require('../services/boardService');

module.exports = {
  getBoardList: async (req, res) => {
    try {
      const list = await boardService.getBoardList(
        req.params.subject,
        req.query.page
      );
      return res.status(200).send(list);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },
};
