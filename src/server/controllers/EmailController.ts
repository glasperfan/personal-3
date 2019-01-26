import { DefaultController } from "./DefaultController";
import { Request, Express, Response, NextFunction, RequestHandler } from "express";
import nodemailer from 'nodemailer';

export interface IEmailControllerSettings {
    user: string;
    pwd: string;
    recipients: string[];
}

export class EmailController extends DefaultController {

    constructor(private settings: IEmailControllerSettings) {
        super();
    }

    registerRoutes(subApp: Express) {
        subApp.post('/', this.sendEmail)
    }

    sendEmail: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
        const name = req.body.name;
        const email = req.body.email;
        const message = req.body.message;

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.settings.user,
                pass: this.settings.pwd
            }
        });

          // setup email data with unicode symbols
        let mailOptions = {
            from: `'${name}' <${email}>`, // sender address
            to: this.settings.recipients, // list of receivers
            subject: 'Hello!', // Subject line
            text: message // plain text body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(404).send('Email failed');
            } else {
                res.status(200).send('Sent!');
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    }
}
