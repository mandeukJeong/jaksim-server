const bcrypt = require("bcrypt");
const connectDB = require("../db/connect");

let db;
connectDB.then((client) => {
    console.log("MongoDB 연결 성공");
    db = client.db("jaksim");
}).catch((error) => {
    console.log(error);
});

module.exports = {
    registerUser: async (userInfo) => {
        try {
            const hashPassword = await bcrypt.hash(userInfo.password, 10);
            return await db.collection("user").insertOne({
                email: userInfo.email,
                nickname: userInfo.nickname,
                password: hashPassword,
                eventCheck: userInfo.eventCheck
            });
        } catch(e) {
            throw(e);
        }    
    }
};  