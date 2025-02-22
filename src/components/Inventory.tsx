import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import type { InventoryItem } from '../types';

interface InventoryProps {
  userRole: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Microscope',
    quantity: 5,
    condition: 'Good',
    warrantyExpiry: '2025-12-31',
    status: 'Available'
  },
  {
    id: '2',
    name: 'Digital Scale',
    quantity: 3,
    condition: 'Fair',
    warrantyExpiry: '2024-06-30',
    status: 'Borrowed',
    borrowedBy: 'John Doe',
    returnDate: '2024-04-01'
  }
];

export default function Inventory({ userRole }: InventoryProps) {
  // Load inventory from localStorage or use initial data
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const savedInventory = localStorage.getItem('labInventory');
    return savedInventory ? JSON.parse(savedInventory) : INITIAL_INVENTORY;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    quantity: 0,
    condition: 'Good',
    warrantyExpiry: '',
    status: 'Available'
  });

  // Save to localStorage whenever inventory changes
  useEffect(() => {
    localStorage.setItem('labInventory', JSON.stringify(inventory));
  }, [inventory]);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    if (!newItem.name || !newItem.warrantyExpiry) return;

    const item: InventoryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity || 0,
      condition: newItem.condition as 'Good' | 'Fair' | 'Poor',
      warrantyExpiry: newItem.warrantyExpiry,
      status: newItem.status as 'Available' | 'Borrowed'
    };

    setInventory([...inventory, item]);
    setNewItem({
      name: '',
      quantity: 0,
      condition: 'Good',
      warrantyExpiry: '',
      status: 'Available'
    });
    setIsModalOpen(false);
  };

  const handleEditItem = (item: InventoryItem) => {
    const updatedInventory = inventory.map(i => 
      i.id === item.id ? { ...item } : i
    );
    setInventory(updatedInventory);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const handleBorrowReturn = (item: InventoryItem) => {
    const updatedItem = { ...item };
    if (item.status === 'Available') {
      updatedItem.status = 'Borrowed';
      updatedItem.borrowedBy = userRole === 'admin' ? 'Admin User' : 'Lab Assistant';
      updatedItem.returnDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else {
      updatedItem.status = 'Available';
      updatedItem.borrowedBy = undefined;
      updatedItem.returnDate = undefined;
    }
    handleEditItem(updatedItem);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        {userRole === 'admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Item
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Warranty Expiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingItem?.id === item.id ? (
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingItem?.id === item.id ? (
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
                      className="border rounded px-2 py-1 w-20"
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingItem?.id === item.id ? (
                    <select
                      value={editingItem.condition}
                      onChange={(e) => setEditingItem({ ...editingItem, condition: e.target.value as 'Good' | 'Fair' | 'Poor' })}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${item.condition === 'Good' ? 'bg-green-100 text-green-800' :
                        item.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                      {item.condition}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingItem?.id === item.id ? (
                    <input
                      type="date"
                      value={editingItem.warrantyExpiry}
                      onChange={(e) => setEditingItem({ ...editingItem, warrantyExpiry: e.target.value })}
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    item.warrantyExpiry
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${item.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {editingItem?.id === item.id ? (
                      <>
                        <button
                          onClick={() => handleEditItem(editingItem)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleBorrowReturn(item)}
                          className={`text-sm px-2 py-1 rounded ${
                            item.status === 'Available' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {item.status === 'Available' ? 'Borrow' : 'Return'}
                        </button>
                        {userRole === 'admin' && (
                          <>
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Add New Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <select
                  value={newItem.condition}
                  onChange={(e) => setNewItem({ ...newItem, condition: e.target.value as 'Good' | 'Fair' | 'Poor' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Warranty Expiry</label>
                <input
                  type="date"
                  value={newItem.warrantyExpiry}
                  onChange={(e) => setNewItem({ ...newItem, warrantyExpiry: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}