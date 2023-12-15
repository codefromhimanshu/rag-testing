// pages/api/auth/[...nextauth].ts
import NextAuth, {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import {User} from '../../../../models';

export const authOptions: NextAuthOptions ={
    providers: [
        
      CredentialsProvider({
        name: 'Credentials',
        async authorize(credentials, req) {
          const user = await User.findOne({where:{email: credentials.email}});

          // Check if user exists and password is correct
          if (user && bcrypt.compareSync(credentials.password, user.password)) {
            // Any object returned will be saved in the session
            return { id: user.id, email: user.email };
          } else {
            throw new Error('Invalid email or password');
          }
        },
      }),

    ],
 
  }

const handler = NextAuth(authOptions);


export { handler as GET, handler as POST }