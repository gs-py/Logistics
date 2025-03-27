import { useEffect, useState } from "react";
import { Trash2, BarChart3, Activity, Clock, ArrowUpRight, RefreshCw } from "lucide-react";
import supabase from "@/service/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface DashboardProps {
  userRole?: string;
}

interface DashboardStats {
  totalItems: number;
  borrowedItems: number;
  overdueItems: number;
  availableItems: number;
}

interface RecentActivity {
  id: number;
  description: string;
  timestamp: string;
}

export default function Dashboard({ userRole }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    borrowedItems: 0,
    overdueItems: 0,
    availableItems: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [itemsDue, setItemsDue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total items
      const { data: totalItems } = await supabase
        .from('inventory')
        .select('count');
      
      // Fetch borrowed items
      const { data: borrowedItems } = await supabase
        .from('transactions')
        .select('count')
        .eq('status', 'borrowed');
      
      // Fetch overdue items
      const { data: overdueItems } = await supabase
        .from('transactions')
        .select('count')
        .eq('status', 'overdue');
      
      // Fetch available items
      const { data: availableItems } = await supabase
        .from('inventory')
        .select('count')
        .eq('status', 'available');

      // Fetch recent transactions with proper joins
      const { data: recentTransactions, error: recentError } = await supabase
        .from('transactions')
        .select(`
          id,
          inventory_id (name),
          borrower_id (name),
          borrow_date,
          status
        `)
        .order('borrow_date', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Fetch items due soon (borrowed items with upcoming return dates)
      const { data: dueItems, error: dueError } = await supabase
        .from('transactions')
        .select(`
          id,
          inventory_id (name),
          borrower_id (name),
          return_date,
          borrow_date
        `)
        .eq('status', 'borrowed')
        .order('return_date', { ascending: true })
        .limit(5);

      if (dueError) throw dueError;

      // Format recent activities
      const activities = recentTransactions?.map(tx => ({
        id: tx.id,
        description: `${tx.borrower_id.name} ${tx.status} ${tx.inventory_id.name}`,
        timestamp: new Date(tx.borrow_date).toLocaleDateString()
      })) || [];

      // Format due items
      const dueItemsFormatted = dueItems?.map(item => ({
        id: item.id,
        description: `${item.inventory_id.name} - Borrowed by ${item.borrower_id.name}`,
        timestamp: `Due: ${new Date(item.return_date).toLocaleDateString()}`
      })) || [];

      setStats({
        totalItems: totalItems?.[0]?.count || 0,
        borrowedItems: borrowedItems?.[0]?.count || 0,
        overdueItems: overdueItems?.[0]?.count || 0,
        availableItems: availableItems?.[0]?.count || 0,
      });
      setRecentActivities(activities);
      // Remove this line
      // setItemsDue(dueItemsFormatted);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const statItems = [
    { id: 'total', label: 'Total Items', value: stats.totalItems },
    { id: 'borrowed', label: 'Borrowed Items', value: stats.borrowedItems },
    { id: 'overdue', label: 'Overdue Items', value: stats.overdueItems },
    { id: 'available', label: 'Available Items', value: stats.availableItems },
  ];

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
        {statItems.map((stat, index) => (
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
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500 hover:text-blue-600 transition-colors"
                onClick={fetchDashboardData}
              >
                <RefreshCw size={16} />
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <div className={`h-1 w-16 rounded-full ${statColors[index % 4].accent} opacity-70`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities Section */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 flex items-center">
            <Activity size={18} className="text-blue-600 mr-2" />
            Recent Activities
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboardData}
            className="text-gray-500 hover:text-blue-600"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
        <ScrollArea className="h-[calc(40vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32 col-span-2">
                <RefreshCw size={24} className="animate-spin text-blue-500" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-200 col-span-2">
                <Activity size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent activities</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-all flex flex-col"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                      {activity.timestamp}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${
                      activity.description.includes('borrowed') ? 'bg-yellow-400' :
                      activity.description.includes('returned') ? 'bg-green-400' :
                      'bg-blue-400'
                    }`} />
                  </div>
                  <p className="text-sm text-gray-800 font-medium">{activity.description}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
