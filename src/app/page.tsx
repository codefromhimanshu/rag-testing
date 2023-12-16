
import React, { useEffect, useState } from 'react';

import { redirect } from 'next/navigation'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../utils/auth-options"


const Home = async () => {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  } else {
    redirect('/rag')
  }
  
};



export default Home;
