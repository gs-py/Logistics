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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Update the Transaction interface to include quantity
interface Transaction {
  id: number;
  borrower_id: number;
  inventory_id: number;
  borrow_date: string;
  return_date: string;
  status: string;
  quantity: number; // Add this
  inventory: {
    id: number;
    name: string;
    category: string;
    status: string;
    remaining_quantity: number; // Add this
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
const [isDamageDialogOpen, setIsDamageDialogOpen] = useState(false);
const [selectedTransaction, setSelectedTransaction] =
  useState<Transaction | null>(null);
const [damagedQuantity, setDamagedQuantity] = useState<number>(0);
  const [damagesFine, setDamagesFine] = useState(0);
  const [damageImage, setDamageImage] = useState<File | null>(null);

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
    const signInAnonymously = async () => {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        return data.session;
      } catch (error) {
        console.error("Error signing in anonymously:", error);
        return null;
      }
    };
// Add this function to handle image upload to Supabase storage
const uploadDamageImage = async (file: File) => {
  try {
   const {
     data: { session },
   } = await supabase.auth.getSession();
   if (!session) {
     // Try anonymous sign in if no session exists
     const anonSession = await signInAnonymously();
     if (!anonSession) {
       throw new Error("Authentication failed");
     }
   }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `damage-images/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('damages')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('damages')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
  // Update fetchTransactions to include remaining_quantity
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("transactions")
        .select(`
          *,
          inventory:inventory_id (id, name, status, remaining_quantity),
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
const calculateFine = (returnDate: string) => {
  const dueDate = new Date(returnDate);
  const today = new Date();

  if (today <= dueDate) return 0;

  const diffTime = Math.abs(today.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays * 10; // $10 per day
};
  // Update handleReturn function
  // const handleReturn = async (transactionId: number, inventoryId: number) => {
  //   try {
  //     setIsLoading(true);

  //     // Get the transaction details to know the quantity
  //     const { data: transactionData, error: transactionFetchError } = await supabase
  //       .from("transactions")
  //       .select("quantity, inventory!inner(remaining_quantity)")
  //       .eq("id", transactionId)
  //       .single();
  //   const fine = calculateFine(transactionData.return_date);
  //   if (fine > 0) {
  //     const confirmReturn = window.confirm(
  //       `This item is overdue. A fine of $${fine} will be charged. Do you want to proceed?`
  //     );
  //     if (!confirmReturn) {
  //       setIsLoading(false);
  //       return;
  //     }
  //   }
  //     if (transactionFetchError) throw transactionFetchError;
  
  //     // Get current inventory details
  //     const { data: inventoryData, error: inventoryFetchError } = await supabase
  //       .from("inventory")
  //       .select("remaining_quantity, quantity")
  //       .eq("id", inventoryId)
  //       .single();
  
  //     if (inventoryFetchError) throw inventoryFetchError;
  
  //     // Calculate new remaining quantity
  //     const newRemainingQuantity = inventoryData.remaining_quantity + transactionData.quantity;
  
  //     // Update transaction status to returned
  //     const { error: transactionError } = await supabase
  //       .from("transactions")
  //       .update({ status: "returned" })
  //       .eq("id", transactionId);
  
  //     if (transactionError) throw transactionError;
  
  //     // Update inventory status and remaining quantity
  //     const { error: inventoryError } = await supabase
  //       .from("inventory")
  //       .update({ 
  //         status: "available",
  //         remaining_quantity: newRemainingQuantity
  //       })
  //       .eq("id", inventoryId);
  
  //     if (inventoryError) throw inventoryError;
  
  //     toast.success(
  //       fine > 0
  //         ? `Item returned successfully. Fine charged: $${fine}`
  //         : "Item returned successfully"
  //     );
  //     fetchTransactions(); // Refresh the list
  //   } catch (error) {
  //     toast.error("Failed to process return");
  //     console.error("Error returning item:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
// Update the Transaction interface
interface Transaction {
  id: number;
  borrower_id: number;
  inventory_id: number;
  borrow_date: string;
  return_date: string;
  status: string;
  quantity: number;
  damaged_quantity: number;
  fine_amount: number;
  inventory: {
    id: number;
    name: string;
    category: string;
    status: string;
    remaining_quantity: number;
  };
  borrower: {
    id: number;
    name: string;
  };
}

// Update handleReturn function
const handleReturn = async (transactionId: number, inventoryId: number) => {
  const { data: transactionData, error: transactionFetchError } = await supabase
    .from("transactions")
    .select(`
      *,
      inventory!inner (
        id,
        name,
        status,
        remaining_quantity
      )
    `)
    .eq("id", transactionId)
    .single();

  if (transactionFetchError) {
    toast.error("Failed to fetch transaction details");
    return;
  }

  setSelectedTransaction(transactionData);
  setDamagedQuantity(0);
  setDamagesFine(0);
  setIsDamageDialogOpen(true);
};

// Update processReturn function
const processReturn = async () => {
  if (!selectedTransaction) return;

  try {
    setIsLoading(true);
let damageImageUrl = null;
if (damageImage && damagedQuantity > 0) {
  damageImageUrl = await uploadDamageImage(damageImage);
}
    const overdueFine = selectedTransaction.return_date
      ? calculateFine(selectedTransaction.return_date)
      : 0;

    const totalFine = overdueFine + damagesFine;
    const goodItems = selectedTransaction.quantity - damagedQuantity;

    const { data: inventoryData, error: inventoryFetchError } = await supabase
      .from("inventory")
      .select("quantity, remaining_quantity")
      .eq("id", selectedTransaction.inventory_id)
      .single();
if (inventoryFetchError) throw inventoryFetchError;
    // Update inventory: add back good items to remaining_quantity and reduce total quantity by damaged items
    const { error: inventoryError } = await supabase
      .from("inventory")
      .update({
        remaining_quantity: inventoryData.remaining_quantity + goodItems,
        quantity: inventoryData.quantity - damagedQuantity,
        
        status: "available",
      })
      .eq("id", selectedTransaction.inventory_id);

    if (inventoryError) throw inventoryError;

    // Then update the transaction
    const { error: transactionError } = await supabase
      .from("transactions")
      .update({
        status: "returned",
        fine_amount: totalFine,
        damaged_quantity: damagedQuantity,
        damage_image_url: damageImageUrl,
        return_date:
          selectedTransaction.return_date || new Date().toISOString(),
      })
      .eq("id", selectedTransaction.id);

    if (transactionError) throw transactionError;

    toast.success(`Item returned successfully. Total fine: $${totalFine}`);
    setIsDamageDialogOpen(false);
    setDamagedQuantity(0);
    setDamagesFine(0);
    setSelectedTransaction(null);
    fetchTransactions();
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
              <RefreshCw
                size={16}
                className={`mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
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
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
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
                <TableHead>Fine</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <RefreshCw
                      size={24}
                      className="animate-spin mx-auto text-blue-600"
                    />
                    <p className="mt-2 text-gray-500">
                      Loading transactions...
                    </p>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-gray-500"
                  >
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
                          <p className="text-xs text-gray-500">
                            ID: {transaction.inventory_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p>
                            {transaction.borrower?.name || "Unknown Borrower"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {transaction.borrower_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transaction.borrow_date
                        ? formatDate(transaction.borrow_date)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div
                        className={`${
                          transaction.status === "borrowed" &&
                          transaction.return_date &&
                          isOverdue(transaction.return_date)
                            ? "text-red-600 font-medium"
                            : ""
                        }`}
                      >
                        {transaction.return_date
                          ? formatDate(transaction.return_date)
                          : "N/A"}
                        {transaction.status === "borrowed" &&
                          transaction.return_date &&
                          isOverdue(transaction.return_date) &&
                          " (Overdue)"}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {transaction.status === "overdue" ? (
                        <span className="text-red-600 font-medium">
                          ${calculateFine(transaction.return_date)}
                        </span>
                      ) : transaction.fine_amount ? (
                        <span className="text-gray-600">
                          ${transaction.fine_amount}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {(transaction.status === "borrowed" ||
                        transaction.status === "overdue") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${
                            transaction.status === "overdue"
                              ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              : "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                          }`}
                          onClick={() =>
                            handleReturn(
                              transaction.id,
                              transaction.inventory_id
                            )
                          }
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
      <Dialog open={isDamageDialogOpen} onOpenChange={setIsDamageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Items</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="damaged" className="text-right">
                Damaged Items
              </Label>
              <Input
                id="damaged"
                type="number"
                className="col-span-3"
                value={damagedQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (
                    selectedTransaction &&
                    val <= selectedTransaction.quantity &&
                    val >= 0
                  ) {
                    setDamagedQuantity(val);
                  }
                }}
              />
            </div>
            {damagedQuantity > 0 && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="damageImage" className="text-right">
                  Damage Photo
                </Label>
                <div className="col-span-3">
                  <Input
                    id="damageImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setDamageImage(file);
                      }
                    }}
                  />
                  {damageImage && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {damageImage.name}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fine" className="text-right">
                Damage Fine ($)
              </Label>
              <Input
                id="fine"
                type="number"
                className="col-span-3"
                value={damagesFine}
                onChange={(e) =>
                  setDamagesFine(Math.max(0, parseFloat(e.target.value)))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDamageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={processReturn}
              disabled={damagedQuantity > 0 && !damageImage}
            >
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RemoveItem;
