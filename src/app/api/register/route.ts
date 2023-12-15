// export const dynamic = 'force-dynamic' // defaults to force-static
import { User } from '../../../models';
import { type NextRequest } from 'next/server'
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
   
    try {
      const { email, password, name } = await request.json();
      const salt = bcrypt.genSaltSync(10);
      const user = await User.create({ email, password: bcrypt.hashSync(password, salt), name });
      return new Response(JSON.stringify({email: user.email}));
      // return Response.json({email: user.email}, {
      //   status: 201,
      // });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Internal Server Error' }));
      // return Response.json({ message: 'Internal Server Error' }, {
      //   status: 500,
      // });
    }
}
