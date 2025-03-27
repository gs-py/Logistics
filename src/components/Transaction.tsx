import { useEffect, useState } from "react";
import supabase from "@/service/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { 
  RefreshCw, 
  Search, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock 
} from "lucide-react";

// Update the Transaction interface first
interface Transaction {
  id: string;
  borrower_id: number;
  inventory_id: number;
  borrow_date: string;
  return_date: string | null;
  status: "borrowed" | "returned" | "overdue";
  borrower: { name: string };  // Changed from borrowers array to single borrower
  inventory: { name: string }; // Changed from inventory array to single item
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, statusFilter, transactions]);

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.borrowers[0]?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.inventory[0]?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    setFilteredTransactions(filtered);
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      let { data, error } = await supabase
        .from("transactions")
        .select(`
          id,
          borrow_date,
          return_date,
          status,
          borrower:borrowers!transactions_borrower_id_fkey(name),
          inventory:inventory!transactions_inventory_id_fkey(name)
        `)
        .order("borrow_date", { ascending: false });
  
      if (error) throw error;
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: "borrowed" | "returned" | "overdue") => {
    switch (status) {
      case "borrowed":
        return { 
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock size={14} className="mr-1" />
        };
      case "returned":
        return { 
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle size={14} className="mr-1" />
        };
      case "overdue":
        return { 
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <AlertCircle size={14} className="mr-1" />
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: null
        };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card className="shadow-md border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Transaction History
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-white/20 text-white hover:bg-white/30 border-white/40"
            onClick={fetchTransactions}
          >
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs ${!statusFilter ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
              onClick={() => setStatusFilter(null)}
            >
              All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs ${statusFilter === 'borrowed' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : ''}`}
              onClick={() => setStatusFilter('borrowed')}
            >
              <Clock size={14} className="mr-1" />
              Borrowed
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs ${statusFilter === 'returned' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
              onClick={() => setStatusFilter('returned')}
            >
              <CheckCircle size={14} className="mr-1" />
              Returned
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`text-xs ${statusFilter === 'overdue' ? 'bg-red-50 text-red-700 border-red-200' : ''}`}
              onClick={() => setStatusFilter('overdue')}
            >
              <AlertCircle size={14} className="mr-1" />
              Overdue
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Borrower</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => {
                  const statusConfig = getStatusConfig(tx.status);
                  return (
                    // Update the table row rendering
                    <TableRow key={tx.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{tx.borrower?.name || "Unknown"}</TableCell>
                      <TableCell>{tx.inventory?.name || "Unknown"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {formatDate(tx.borrow_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {formatDate(tx.return_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Transactions;
