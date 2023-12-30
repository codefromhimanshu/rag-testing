import nodemailer from "nodemailer";
import * as aws from "@aws-sdk/client-ses";
import  { defaultProvider } from "@aws-sdk/credential-provider-node";
// So we can use .env variables locally import dotenv
import * as dotenv from 'dotenv' 

dotenv.config()

// aws.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION || "ap-south-1" // Example region
// });

const ses = new aws.SES({
  apiVersion: "2012-10-17",
  region: "ap-south-1", // Your region will need to be updated
  // sslEnabled: false,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_ACCESS_SECRET as string,
  },
});


// create Nodemailer SES transporter
// const transporter = nodemailer.createTransport({
//   SES: new aws.SES({
//         apiVersion: "2012-10-17"
//     }),
// });

let transporter = nodemailer.createTransport({
    SES: { ses, aws },
  });
  
type options = {
    to:string;
    subject:string; 
    html:string;
    from:string; 
}

const sendMail = (options:options) => {
  transporter.sendMail(
   
      {
        from: options.from ||process.env.DEFAULT_FROM_EMAIL, // replace with your own address
        to: options.to, // replace with your own address
        subject: options.subject,
        html: options.html,
        // text: options.html.replace(/<[^>]*>/g, ''),
      },
      // callback
      (error:any, info:any) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.messageId);
        }
      }
    );
};

export default sendMail;