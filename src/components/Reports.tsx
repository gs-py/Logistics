import React from 'react';
import { BarChart, Activity, Package, AlertTriangle } from 'lucide-react';

interface ReportsProps {
  userRole: string;
}

export default function Reports({ userRole }: ReportsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-indigo-600" size={24} />
            <h3 className="font-bold">Stock Movement</h3>
          </div>
          <div className="bg-white p-4 rounded">
            <p className="text-sm mb-2">Most Borrowed Items (Last 30 Days)</p>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Microscopes</span>
                <span className="font-semibold">32 times</span>
              </li>
              <li className="flex justify-between">
                <span>Digital Scales</span>
                <span className="font-semibold">28 times</span>
              </li>
              <li className="flex justify-between">
                <span>pH Meters</span>
                <span className="font-semibold">25 times</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-indigo-600" size={24} />
            <h3 className="font-bold">Inventory Status</h3>
          </div>
          <div className="bg-white p-4 rounded">
            <p className="text-sm mb-2">Current Stock Levels</p>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Total Items</span>
                <span className="font-semibold">156</span>
              </li>
              <li className="flex justify-between">
                <span>Available</span>
                <span className="font-semibold">142</span>
              </li>
              <li className="flex justify-between">
                <span>Borrowed</span>
                <span className="font-semibold">14</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-indigo-600" size={24} />
            <h3 className="font-bold">Maintenance Alerts</h3>
          </div>
          <div className="bg-white p-4 rounded">
            <p className="text-sm mb-2">Items Requiring Attention</p>
            <ul className="space-y-2">
              <li className="flex justify-between text-yellow-600">
                <span>Warranty Expiring Soon</span>
                <span className="font-semibold">5 items</span>
              </li>
              <li className="flex justify-between text-red-600">
                <span>Maintenance Due</span>
                <span className="font-semibold">3 items</span>
              </li>
              <li className="flex justify-between text-orange-600">
                <span>Low Stock Items</span>
                <span className="font-semibold">8 items</span>
              </li>
            </ul>
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <BarChart className="text-indigo-600" size={24} />
              <h3 className="font-bold">Procurement Analysis</h3>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="text-sm mb-2">Recommended Purchases</p>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Glass Beakers (100ml)</span>
                  <span className="font-semibold">20 units</span>
                </li>
                <li className="flex justify-between">
                  <span>Safety Goggles</span>
                  <span className="font-semibold">15 units</span>
                </li>
                <li className="flex justify-between">
                  <span>Digital Thermometers</span>
                  <span className="font-semibold">10 units</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}