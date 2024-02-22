const userService = require('../services/userService');
const passport = require("passport");
const jwt = require("jsonwebtoken");

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
    },

    loginUser: async (req, res, next) => {
        try {
            passport.authenticate("local", (error, user, info) => {
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
                    const token = jwt.sign({ id: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
                    res.status(200).json({token});
                });
            })(req, res, next);
        } catch(e) {
            res.status(500).json({ error: e.message });
        }
    },

    sendEmail: async (req, res) => {
        try {
            const authNumber = Math.random().toString().substring(2, 6);
            res.cookie("auth", authNumber, {
                maxAge: 10 * 6000 * 5
            });
            const { email } = req.body;
            const emailInfo = {
                toEmail: email,
                subject: "작심하루 이메일 인증번호 발송 메일입니다.",
                text: `${email}님 안녕하세요!\n\n 인증번호: ${authNumber}\n\n 인증번호를 화면에 입력해주세요!`
            };
            await userService.sendEmail(emailInfo);
            res.status(200).send("이메일 전송 성공");
        } catch(e) {
            // 존재하지 않는 이메일일 경우
            if (e.code === 404) {
                return res.status(e.code).json({ error: e.message });
            } else {
                return res.status(500).json({ error: e.message });
            }
        }
    }
}