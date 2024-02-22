const nodemailer = require("nodemailer");
const senderInfo = require("../config/senderInfo.json");

const mailSender = {
    sendMail (param) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            prot: 587,
            host: "smtp.gmlail.com",
            secure: false,
            requireTLS: true,
            auth: {
                user: senderInfo.user,
                pass: senderInfo.pass
            } 
        });

        const mailOptions = {
            from: senderInfo.user,
            to: param.toEmail,
            subject: param.subject,
            text: param.text
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log("Email send: ", info.response);
            }
        });
    }
}

module.exports = mailSender;