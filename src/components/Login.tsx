import React, { useState } from 'react';
import { Shield, User, Lock, Loader2 } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      onLogin({ role: user.role, name: user.name });
    } else {
      setError('Invalid username or password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50" />
      
      <div className="relative w-full max-w-4xl mx-4 grid md:grid-cols-2 rounded-2xl shadow-2xl bg-white overflow-hidden">
        {/* Left side - Hero Section */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2940')] bg-cover bg-center mix-blend-overlay" />
          <div className="relative h-full flex flex-col justify-between p-12 text-white">
            <div className="mb-8">
              <Shield size={40} className="text-white/90" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4">laboratory Stock Management System</h2>
              <p className="text-blue-100 text-lg">
                Streamline your laboratory inventory management with our comprehensive solution
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h3 className="font-semibold">Efficient</h3>
                  <p className="text-sm text-blue-100">Real-time tracking</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                  <h3 className="font-semibold">Secure</h3>
                  <p className="text-sm text-blue-100">Role-based access</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50" />
          <div className="absolute right-0 top-0 w-40 h-40 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-3xl transform translate-x-20 -translate-y-20" />
          <div className="absolute left-0 bottom-0 w-40 h-40 bg-gradient-to-br from-purple-100/20 to-blue-100/20 rounded-full blur-3xl transform -translate-x-20 translate-y-20" />
          
          <div className="max-w-sm mx-auto relative">
            <div className="text-center mb-8">
              <Shield size={40} className="mx-auto mb-4 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-2">Please sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 backdrop-blur-sm bg-white/50 p-6 rounded-2xl border border-white/60 shadow-xl">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center justify-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative group">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/70 backdrop-blur-sm hover:bg-white/90"
                      placeholder="Enter your username"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white/70 backdrop-blur-sm hover:bg-white/90"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all active:scale-[0.98] font-medium disabled:opacity-70 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}