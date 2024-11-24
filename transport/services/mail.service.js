const nodeMailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodeMailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }
    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Активация аккаунта на ${process.env.BASE_URL}`,
            text: '',
            html:
                `
                <div>
                    <h1>Для активации перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
                `
        });
    }
    async sendResetMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Сброс пароля на ${process.env.BASE_URL}`,
            text: '',
            html:
                `
                <div>
                    <h1>Для сброса пароля перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                    <p>Если вы не запрашивали сброс пароля, то просто проигнорируйте это письмо</p>
                </div>
                `
        });
    }
}

module.exports = new MailService();