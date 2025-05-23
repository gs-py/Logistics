// Fix the React import
import React, { useState, useEffect } from "react";
import {
  Shield,
  
  Users as UsersIcon,
  BarChart3,
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Package,
  UserPlus,
  Trash2,
  ShoppingCart,
} from "lucide-react";
import { GrTransaction } from "react-icons/gr";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Inventory from "./components/Inventory";
import UsersManagement from "./components/Users";
import Reports from "./components/Reports";
import Students from "./components/Borrowers";
import BorrowItem from "./components/AddItem";
import RemoveItem from "./components/RemoveItem";
import Transactions from "./components/Transaction";
import { MdAddBox } from "react-icons/md";
import { Toaster } from "react-hot-toast";

import CartRequests from "./components/CartRequests";
import supabase from "./service/supabase";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    role: string;
    name: string;
    status?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [pendingCartRequests, setPendingCartRequests] = useState(0);
const fetchPendingCartRequests = async () => {
  try {
    const { count, error } = await supabase
      .from("cart")
      .select("id", { count: "exact" })
      .eq("status", "requested");

    if (error) throw error;
    setPendingCartRequests(count || 0);
  } catch (error) {
    console.error("Error fetching pending cart requests:", error);
  }
};
  useEffect(() => {
    // Generate unique tab ID
    if (!sessionStorage.getItem('tabId')) {
      sessionStorage.setItem('tabId', Math.random().toString(36).substring(7));
    }
    const tabId = sessionStorage.getItem('tabId');

    const checkAuthStatus = () => {
      const storedAuth = localStorage.getItem(`labStockAuth-${tabId}`);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(authData.isAuthenticated);
        setCurrentUser(authData.user);
      }
    };

    checkAuthStatus();
    if (isAuthenticated) {
      fetchPendingCartRequests();
    }

    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const handleLogin = (user: { role: string; name: string }) => {
    const tabId = sessionStorage.getItem('tabId');
    const authData = { isAuthenticated: true, user: { ...user } };
    localStorage.setItem(`labStockAuth-${tabId}`, JSON.stringify(authData));
    setIsAuthenticated(true);
    setCurrentUser(user);
  };



  // Show pending approval message for assistants
 
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // In the menuItems array, we'll keep the access control
  // Update menuItems array to include the pending approvals section for admin
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      access: "admin",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: <Package size={20} />,
      access: "all",
    },
    {
      id: "users",
      label: "Users",
      icon: <UsersIcon size={20} />,
      access: "admin", // Already restricted to admin
    },
    {
      id: "Borrowers",
      label: "Borrowers",
      icon: <UserPlus size={20} />,
      access: "all",
    },
    {
      id: "add-item",
      label: "Checkout Item",
      icon: <MdAddBox size={20} />,
      access: "all",
    },
    {
      id: "remove-item",
      label: "Return Item",
      icon: <Trash2 size={20} />,
      access: "all",
    },
    {
      id: "cart-requests",
      label: "Cart Requests",
      icon: <ShoppingCart size={20} />,
      access: "all",
      badge: pendingCartRequests,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: <GrTransaction size={20} className="text-current" />,
      access: "all",
    },
    {
      id: "reports",
      label: "Reports",
      icon: <BarChart3 size={20} />,
      access: "admin",
    },
  
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Top Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-full hover:bg-white/10 lg:hidden"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="flex items-center gap-2">
                <Shield size={24} className="text-white" />
                <h1 className="text-xl font-bold hidden sm:block">
                  Laboratory Stock Management System
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>
                  {currentUser?.role === "admin"
                    ? "Administrator"
                    : "Lab Assistant"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{currentUser?.name}</span>
              </div>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1 text-sm transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } pt-16 lg:pt-0 h-screen lg:h-[calc(100vh-56px)]`}
        >
          <div className="p-4 h-full flex flex-col">
            <div className="mb-6 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <p className="font-medium">Welcome,</p>
              <p>{currentUser?.name}</p>
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto">
              {menuItems.map((item) => {
                if (item.access === "admin" && currentUser?.role !== "admin") {
                  return null;
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-medium border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${
                          activeTab === item.id
                            ? "text-blue-600"
                            : "text-gray-500"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {activeTab === item.id && (
                      <ChevronRight size={16} className="text-blue-600" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-800 mb-1">
                  Lab Stock System
                </p>
                <p className="text-blue-600 text-xs">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto">
            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              ></div>
            )}

            {activeTab === "dashboard" && currentUser?.role === "admin" && (
              <Dashboard userRole={currentUser?.role || ""} />
            )}
            {activeTab === "inventory" && (
              <Inventory currentUser={currentUser} />
            )}
            {activeTab === "users" && currentUser?.role === "admin" && (
              <UsersManagement />
            )}
            {activeTab === "reports" && currentUser?.role === "admin" && (
              <Reports userRole={currentUser?.role || ""} />
            )}
            {activeTab === "Borrowers" && <Students />}
            {activeTab === "add-item" && <BorrowItem />}
            {activeTab === "remove-item" && <RemoveItem />}
            {activeTab === "transactions" && <Transactions />}
            {activeTab === "cart-requests" && (
              <CartRequests
                currentUser={currentUser}
                onRequestProcessed={fetchPendingCartRequests}
              />
            )}
            {/* {activeTab === "pending-approvals" &&
              currentUser?.role === "admin" && <PendingApprovals />} */}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
