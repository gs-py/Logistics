import { useState } from "react";
import { Trash2, BarChart3, Activity, Clock, ArrowUpRight } from "lucide-react";
import {
  stats as initialStats,
  recentActivities as initialActivities,
  itemsDue as initialItemsDue,
  updateStat,
  deleteActivity,
  deleteDueItem,
} from "./Data/DasnBoarddata";

interface DashboardProps {
  userRole?: string;
}

export default function Dashboard({ userRole }: DashboardProps) {
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

  const statColors = [
    { bg: "bg-blue-50", icon: "text-blue-600", accent: "bg-blue-500" },
    { bg: "bg-purple-50", icon: "text-purple-600", accent: "bg-purple-500" },
    { bg: "bg-green-50", icon: "text-green-600", accent: "bg-green-500" },
    { bg: "bg-amber-50", icon: "text-amber-600", accent: "bg-amber-500" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="mt-2 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
            <Clock size={14} className="mr-1" />
            Last updated: Today, 10:30 AM
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={stat.id} 
            className={`${statColors[index % 4].bg} rounded-xl p-5 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${statColors[index % 4].icon}`}>
                {index === 0 && <BarChart3 size={20} />}
                {index === 1 && <Activity size={20} />}
                {index === 2 && <Clock size={20} />}
                {index === 3 && <ArrowUpRight size={20} />}
              </div>
              <button
                className="text-gray-500 hover:text-blue-600 transition-colors"
                onClick={() => handleUpdateStat(stat.id)}
              >
                Edit
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <div className={`h-1 w-16 rounded-full ${statColors[index % 4].accent} opacity-70`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities and Items Due */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Activity size={18} className="text-blue-600 mr-2" />
            Recent Activities
          </h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white p-4 rounded-lg border border-gray-100 flex justify-between items-start hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
                <button
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  onClick={() => handleDeleteActivity(activity.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Items Due Soon */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Clock size={18} className="text-purple-600 mr-2" />
            Items Due Soon
          </h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {itemsDue.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg border border-gray-100 flex justify-between items-start hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="text-sm text-gray-800 font-medium">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.timestamp}</p>
                </div>
                <button
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
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
