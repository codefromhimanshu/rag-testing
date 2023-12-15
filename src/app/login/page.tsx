'use client';
import React, { useState } from 'react';
import { signIn, getCsrfToken, getProviders } from 'next-auth/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const csrfToken = await getCsrfToken()
    const providers = await getProviders()

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/rag'
    });

    if (result.error) {
      // Handle errors here
    } else {
      // Redirect to the protected page
      window.location.href = '/rag';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex min-h-screen justify-center items-center">
      <form onSubmit={handleLogin} className="bg-white p-20 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-10 text-gray-800">Login</h2>
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
          Sign in
        </button>
        <a
          href="/signup"
          className="mb-6 ml-6 bg-white text-cyan-500 hover:bg-cyan-600 hover:text-white focus:ring-4 focus:ring-cyan-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Register
        </a>
      </form>
    </div>
    </div>
  );
};

export default LoginPage;
