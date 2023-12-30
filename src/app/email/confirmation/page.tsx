
import React from 'react';
import Image from 'next/image';

import { User } from '../../../models';
import {decryptEmail} from '../../../utils/index';

const EmailConfirmationPage = async ({ searchParams }:{ searchParams: any}) => {
  const { token } =searchParams;
  const email = decryptEmail(decodeURIComponent(token));
  const user = await User.findOne({
    where: { email: email },
  });

  if(user) {
    user.isEmailConfirmed=true;
    user.save();  
  }
   
  return (
      <div className="min-h-screen bg-gray-100 ">
        <div className="bg-white px-4 py-5 shadow-md fixed w-full">
          <div className="flex justify-between items-center max-w-6xl mx-auto ">
            <span className='w-80 flex justify-normal' >
              <Image src="/zonko.png" className='w-10 h-10 mr-4' alt="Zonko logo" width={10} height={10}/>
              <h1 className="text-xl font-bold">Rag Testing flow</h1>
            </span>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-4">
          Email Confirmed
        </div>
      </div>
  );
};



export default EmailConfirmationPage;
