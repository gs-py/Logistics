import React, { useState } from 'react';
import { Shield, User, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { role: string; name: string }) => void;
}

const MOCK_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { username: 'assistant', password: 'asst123', role: 'assistant', name: 'Lab Assistant' },
];

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      onLogin({ role: user.role, name: user.name });
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2940&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-[2px]" />
      
      <div className="relative flex overflow-hidden rounded-3xl shadow-2xl w-full max-w-4xl mx-4">
        {/* Left side - Image */}
        <div className="hidden md:block w-1/2 bg-cover bg-center" 
          style={{backgroundImage: `url('https://images.unsplash.com/photo-1581093198572-b932632e8a8e?q=80&w=1470&auto=format&fit=crop')`}}>
          <div className="h-full w-full bg-gradient-to-b from-blue-600/40 to-purple-800/60 flex flex-col justify-end p-8">
            <h2 className="text-white text-3xl font-bold mb-2">Lab Stock Management</h2>
            <p className="text-blue-100 mb-6">Efficiently manage your laboratory inventory</p>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 bg-white p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full mb-4 shadow-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center justify-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="relative">
                <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all active:scale-[0.98] font-medium"
            >
              Sign In
            </button>

            <div className="text-center text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Admin: admin / admin123</p>
              <p>Assistant: assistant / asst123</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}