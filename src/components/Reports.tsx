import React, { useState, useEffect } from 'react';
import { BarChart, Activity, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import supabase from "@/service/supabase";
import { toast } from "react-hot-toast";

interface ReportsProps {
  userRole: string;
}

interface ReportStats {
  totalItems: number;
  availableItems: number;
  borrowedItems: number;
  overdueItems: number;
  maintenanceItems: number;
  mostBorrowedItems: Array<{
    name: string;
    count: number;
  }>;
  lowStockItems: Array<{
    name: string;
    quantity: number;
  }>;
}

export default function Reports({ userRole }: ReportsProps) {
  const [stats, setStats] = useState<ReportStats>({
    totalItems: 0,
    availableItems: 0,
    borrowedItems: 0,
    overdueItems: 0,
    maintenanceItems: 0,
    mostBorrowedItems: [],
    lowStockItems: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);

      // Fetch inventory statistics
      const { data: inventoryStats, error: inventoryError } = await supabase
        .from('inventory')
        .select('status')
        .not('status', 'is', null);

      if (inventoryError) throw inventoryError;

      // Fetch most borrowed items (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: borrowedItems, error: borrowedError } = await supabase
        .from('transactions')
        .select(`
          inventory_id,
          inventory:inventory_id (name)
        `)
        .gte('borrow_date', thirtyDaysAgo.toISOString())
        .eq('status', 'borrowed');

      if (borrowedError) throw borrowedError;

      // Process inventory statistics
      const stats = inventoryStats.reduce((acc: any, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});

      // Process most borrowed items
      const borrowedCounts = borrowedItems.reduce((acc: any, item) => {
        const name = item.inventory.name;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const mostBorrowed = Object.entries(borrowedCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      // Fetch low stock items (quantity less than 5)
      const { data: lowStock, error: lowStockError } = await supabase
        .from('inventory')
        .select('name, quantity')
        .lt('quantity', 5)
        .order('quantity');

      if (lowStockError) throw lowStockError;

      setStats({
        totalItems: inventoryStats.length,
        availableItems: stats.available || 0,
        borrowedItems: stats.borrowed || 0,
        overdueItems: stats.overdue || 0,
        maintenanceItems: stats.maintenance || 0,
        mostBorrowedItems: mostBorrowed,
        lowStockItems: lowStock || []
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart size={20} />
            Analytics Dashboard
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 border-white/40"
            onClick={fetchReportData}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Items', value: stats.totalItems, color: 'blue' },
            { label: 'Available', value: stats.availableItems, color: 'green' },
            { label: 'Borrowed', value: stats.borrowedItems, color: 'yellow' },
            { label: 'Overdue', value: stats.overdueItems, color: 'red' }
          ].map((stat, index) => (
            <div key={index} className={`bg-${stat.color}-50 p-4 rounded-xl border border-${stat.color}-100`}>
              <h3 className={`text-${stat.color}-800 text-sm font-medium`}>{stat.label}</h3>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={18} className="text-blue-600" />
              Most Borrowed Items (Last 30 Days)
            </h3>
            <div className="space-y-3">
              {stats.mostBorrowedItems.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-blue-600 font-semibold">{item.count} times</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-600" />
              Low Stock Alert
            </h3>
            <div className="space-y-3">
              {stats.lowStockItems.map((item, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-red-600 font-semibold">{item.quantity} left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}