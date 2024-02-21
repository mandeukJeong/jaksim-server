const userService = require('../services/userService');

module.exports = {
    registerUser: async (req, res) => {
        // email, nickname, password 미입력, 이용약관 동의 체크 x
        if (!req.body.email || !req.body.nickname || !req.body.password) {
            return res.status(400).json({
                message: "Invalid request body. Must include email, nickname and password"
            });     
        } else if (!req.body.serviceCheck || !req.body.personalCheck || req.body.eventCheck === undefined) {
            return res.status(400).json({
                message: "Invalid request body. Must check serviceCheck, personalCheck and eventCheck"
            });      
        }
        try {
            const newUser = await userService.registerUser(req.body);
            return res.status(201).json(newUser);
            
        } catch(e) {
            // 중복된 이메일로 회원가입 요청 시
            if (e.code === 400) {
                return res.status(e.code).json({ error: e.message });
            } else {
                return res.status(500).json({ error: e.message });
            }
        }
    }
}