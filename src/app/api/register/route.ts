// export const dynamic = 'force-dynamic' // defaults to force-static
import { User } from '../../../models';
import { type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs';
import sendMail from '../../../utils/send-email';
import {encryptEmail} from '../../../utils/index';
import welcomeEmailTemplate  from '../../../templates/welcome-email-template';

const sendEmailToUser = async (email:string, userName:string) => {

  const html = welcomeEmailTemplate(userName,`${process.env.HOST_URL}/email/confirmation?token=${encodeURIComponent(encryptEmail(email))}`, process.env.SERVICE_NAME as string,);

  await sendMail({
      to: email,
      subject: `Welcome to ${process.env.SERVICE_NAME}!`,
      html: html,
      from: process.env.DEFAULT_FROM_EMAIL as string,
  });
};

export async function POST(request: NextRequest) {
   
    try {
      const { email, password, name } = await request.json();
      const salt = bcrypt.genSaltSync(10);
      const user = await User.create({ email, password: bcrypt.hashSync(password, salt), name, isEmailConfirmed: false });
      sendEmailToUser(email, name)
      return new Response(JSON.stringify({email: user.email}));

    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal Server Error' }));
    }
}
