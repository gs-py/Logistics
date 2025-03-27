import { useEffect, useState } from "react";
import supabase from "@/service/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Package, Search, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";

interface Transaction {
  id: number;
  borrower_id: number;
  inventory_id: number;
  borrow_date: string;
  return_date: string;
  status: string;
  inventory: {
    id: number;
    name: string;
    category: string;
    status: string;
  };
  borrower: {
    id: number;
    name: string;
  };
}

const RemoveItem = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("borrowed");

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredTransactions(
        transactions.filter(
          (transaction) =>
            transaction.inventory?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.borrower?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchTerm, transactions]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("transactions")
        .select(`
          *,
          inventory:inventory_id (id, name, status),
          borrower:borrower_id (id, name)
        `)
        .order("borrow_date", { ascending: false });
      
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (error) {
      toast.error("Failed to load transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturn = async (transactionId: number, inventoryId: number) => {
    try {
      setIsLoading(true);
      
      // Update transaction status to returned
      const { error: transactionError } = await supabase
        .from("transactions")
        .update({ status: "returned" })
        .eq("id", transactionId);

      if (transactionError) throw transactionError;

      // Update inventory status to available
      const { error: inventoryError } = await supabase
        .from("inventory")
        .update({ status: "available" })
        .eq("id", inventoryId);

      if (inventoryError) throw inventoryError;

      toast.success("Item returned successfully");
      fetchTransactions(); // Refresh the list
    } catch (error) {
      toast.error("Failed to process return");
      console.error("Error returning item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "borrowed":
        return <Badge className="bg-blue-100 text-blue-800">Borrowed</Badge>;
      case "returned":
        return <Badge className="bg-green-100 text-green-800">Returned</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const isOverdue = (returnDate: string) => {
    const today = new Date();
    const dueDate = new Date(returnDate);
    return today > dueDate;
  };

  const updateOverdueItems = async () => {
    try {
      setIsLoading(true);
      
      // Get all borrowed transactions
      const { data: borrowedItems, error: fetchError } = await supabase
        .from("transactions")
        .select("*")
        .eq("status", "borrowed");
        
      if (fetchError) throw fetchError;
      
      // Filter for overdue items
      const overdueItems = borrowedItems?.filter(item => 
        item.return_date && isOverdue(item.return_date)
      ) || [];
      
      // Update each overdue item
      for (const item of overdueItems) {
        const { error } = await supabase
          .from("transactions")
          .update({ status: "overdue" })
          .eq("id", item.id);
          
        if (error) throw error;
      }
      
      if (overdueItems.length > 0) {
        toast.success(`Updated ${overdueItems.length} overdue items`);
      } else {
        toast.success("No overdue items found");
      }
      
      fetchTransactions(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update overdue items");
      console.error("Error updating overdue items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Trash2 size={20} />
            Return Items
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
              onClick={updateOverdueItems}
              disabled={isLoading}
            >
              <RefreshCw size={16} className="mr-1" />
              Check Overdue
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
              onClick={fetchTransactions}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search items or borrowers..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
              {filteredTransactions.length} items
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Item</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-gray-500">Loading transactions...</p>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    {searchTerm ? (
                      <>No transactions match your search criteria</>
                    ) : (
                      <>No transactions found</>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-medium">
                          <Package size={14} />
                        </div>
                        <div>
                          <p>{transaction.inventory?.name || "Unknown Item"}</p>
                          <p className="text-xs text-gray-500">ID: {transaction.inventory_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p>{transaction.borrower?.name || "Unknown Borrower"}</p>
                          <p className="text-xs text-gray-500">ID: {transaction.borrower_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.borrow_date ? formatDate(transaction.borrow_date) : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className={`${
                        transaction.status === "borrowed" && 
                        transaction.return_date && 
                        isOverdue(transaction.return_date) ? 
                        "text-red-600 font-medium" : ""
                      }`}>
                        {transaction.return_date ? formatDate(transaction.return_date) : "N/A"}
                        {transaction.status === "borrowed" && 
                         transaction.return_date && 
                         isOverdue(transaction.return_date) && 
                         " (Overdue)"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(transaction.status === "borrowed" || transaction.status === "overdue") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${
                            transaction.status === "overdue" 
                              ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              : "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                          }`}
                          onClick={() => handleReturn(transaction.id, transaction.inventory_id)}
                          disabled={isLoading}
                        >
                          Return Item
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RemoveItem;