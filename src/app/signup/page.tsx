'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';


const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const signup = async (name: string, email:string, password:string) => {
    try {
      const response = await fetch(`/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email: email, password: password, name:name})
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      router.push('/login');
    } catch (error) {
      console.error('Failed to register user:', error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    signup(name, email, password, )
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex min-h-screen  justify-center items-center">
      <form onSubmit={handleSignup} className="bg-white p-20 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-10 text-gray-800">Login</h2>
        <div className="mb-6">
        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
            Your email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="name@example.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Your password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="••••••••"
          />
        </div>
    
        <button
          type="submit"
          className="mb-6 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Register
        </button>
        <a
          href="/login"
          className="mb-6 ml-6 bg-white text-cyan-500 hover:bg-cyan-600 hover:text-white focus:ring-4 focus:ring-cyan-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
         Sign in
        </a>
      </form>
    </div>
    </div>
  );
};

export default SignupPage;
