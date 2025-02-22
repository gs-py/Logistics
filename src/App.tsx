import React, { useState } from 'react';
import { Shield, ClipboardList, Users as UsersIcon, BarChart3 } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import UsersManagement from './components/Users';
import Reports from './components/Reports';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (user: { role: string; name: string }) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lab Stock Management</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {currentUser?.name}</span>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto mt-8 flex gap-6">
        <aside className="w-64">
          <div className="bg-white rounded-lg shadow-md p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2 p-2 rounded ${
                  activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
                }`}
              >
                <Shield size={20} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center gap-2 p-2 rounded ${
                  activeTab === 'inventory' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
                }`}
              >
                <ClipboardList size={20} />
                Inventory
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-2 p-2 rounded ${
                    activeTab === 'users' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <UsersIcon size={20} />
                  Users
                </button>
              )}
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-2 p-2 rounded ${
                  activeTab === 'reports' ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'
                }`}
              >
                <BarChart3 size={20} />
                Reports
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1">
          {activeTab === 'dashboard' && <Dashboard userRole={currentUser?.role || ''} />}
          {activeTab === 'inventory' && <Inventory userRole={currentUser?.role || ''} />}
          {activeTab === 'users' && currentUser?.role === 'admin' && <UsersManagement />}
          {activeTab === 'reports' && <Reports userRole={currentUser?.role || ''} />}
        </main>
      </div>
    </div>
  );
}

export default App;