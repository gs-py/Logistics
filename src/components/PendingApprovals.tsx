import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Check, X, UserPlus } from 'lucide-react';

const PendingApprovals = () => {
  const [pendingAssistants, setPendingAssistants] = useState<any[]>([]);

  useEffect(() => {
    const checkPendingApprovals = () => {
      // Check all pending assistants in localStorage
      const allKeys = Object.keys(localStorage);
      const pendingKeys = allKeys.filter(key => key.startsWith('labStockAuth-pending-'));
      
      const pendingUsers = pendingKeys.map(key => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(data => data && data.user?.status === 'pending');

      setPendingAssistants(pendingUsers);
    };

    checkPendingApprovals();
    window.addEventListener('storage', checkPendingApprovals);
    return () => window.removeEventListener('storage', checkPendingApprovals);
  }, []);

  const handleApprove = (assistant: any) => {
    const tabId = assistant.tabId || sessionStorage.getItem('tabId');
    const authData = { isAuthenticated: true, user: { ...assistant.user, status: 'approved' } };
    localStorage.setItem(`labStockAuth-${tabId}`, JSON.stringify(authData));
    localStorage.removeItem(`labStockAuth-pending-${tabId}`);
    setPendingAssistants(prev => prev.filter(a => a.user.name !== assistant.user.name));
    toast.success(`${assistant.user.name} has been approved`);
  };

  const handleReject = (assistant: any) => {
    const tabId = assistant.tabId || sessionStorage.getItem('tabId');
    const authData = { isAuthenticated: false, user: { ...assistant.user, status: 'rejected' } };
    localStorage.setItem(`labStockAuth-${tabId}`, JSON.stringify(authData));
    localStorage.removeItem(`labStockAuth-pending-${tabId}`);
    setPendingAssistants(prev => prev.filter(a => a.user.name !== assistant.user.name));
    toast.error(`${assistant.user.name}'s request has been rejected`);
  };

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserPlus className="text-blue-600" />
            Assistant Approval Requests
          </h2>
        </div>

        {pendingAssistants.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Pending Requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no assistant approval requests at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAssistants.map((assistant, index) => (
              <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{assistant.user.name}</p>
                  <p className="text-sm text-gray-500">Requesting Access as Assistant</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(assistant)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(assistant)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovals;