import { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  stats as initialStats,
  recentActivities as initialActivities,
  itemsDue as initialItemsDue,
  updateStat,
  deleteActivity,
  deleteDueItem,
} from "./Data/DasnBoarddata";

export default function Dashboard() {
  const [stats, setStats] = useState(initialStats);
  const [recentActivities, setRecentActivities] = useState(initialActivities);
  const [itemsDue, setItemsDue] = useState(initialItemsDue);

  // Handle updating stats
  const handleUpdateStat = (id: number) => {
    const newValue = prompt("Enter new value:");
    if (newValue) {
      updateStat(id, parseInt(newValue));
      setStats([...initialStats]);
    }
  };

  // Handle deleting recent activity
  const handleDeleteActivity = (id: number) => {
    deleteActivity(id);
    setRecentActivities([...initialActivities]);
  };

  // Handle deleting due items
  const handleDeleteDueItem = (id: number) => {
    deleteDueItem(id);
    setItemsDue([...initialItemsDue]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleUpdateStat(stat.id)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white p-3 rounded flex justify-between"
              >
                <div>
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteActivity(activity.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Items Due Soon */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-4">Items Due Soon</h3>
          <div className="space-y-3">
            {itemsDue.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded flex justify-between"
              >
                <div>
                  <p className="text-sm">{item.description}</p>
                  <p className="text-xs text-gray-500">{item.timestamp}</p>
                </div>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteDueItem(item.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
