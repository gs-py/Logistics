import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import supabase from "@/service/supabase";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Package, Search, Plus, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Add these to your existing interfaces
interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  remaining_quantity: number; // Add this
  status: "borrowed" | "available" | "maintenance" | "damaged" | "out_of_stock";
  description?: string;
  category?: string;
}

const AdminInventoryTab = ({currentUser}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const statusColors = {
  
    available: "bg-green-100 text-green-800 border-green-200",
    maintenance: "bg-gray-100 text-gray-800 border-gray-200",
    damaged: "bg-red-100 text-red-800 border-red-200",
    out_of_stock: "bg-orange-100 text-orange-800 border-orange-200",
  };
  
  const statusIcons = {
   
    available: "✅",
    maintenance: "🔧",
    damaged: "⚠️",
    out_of_stock: "❌",
  };

  useEffect(() => {
    fetchInventory();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredInventory(
        inventory.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.status.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchTerm, inventory]);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      let { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      
      // Check and update status for each item
      for (const item of data || []) {
        if (item.quantity <= 0 && item.status !== 'out_of_stock') {
          await updateStockStatus(item);
        }
      }
      
      // Fetch updated inventory
      const { data: updatedData, error: refreshError } = await supabase
        .from("inventory")
        .select("*");
      
      if (refreshError) throw refreshError;
      setInventory(updatedData || []);
      setFilteredInventory(updatedData || []);
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStockStatus = async (item: InventoryItem) => {
    try {
      const { error } = await supabase
        .from("inventory")
        .update({ 
          status: 'out_of_stock',
          remaining_quantity: 0 
        })
        .eq("id", item.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error updating stock status:", error);
      return false;
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;
  
    try {
      // Ensure remaining_quantity doesn't exceed quantity
      const remaining_quantity = Math.min(
        selectedItem.remaining_quantity, 
        selectedItem.quantity
      );
  
      // Set status based on quantity
      let status = selectedItem.status;
      if (selectedItem.quantity === 0) {
        status = 'out_of_stock';
      } else if (remaining_quantity === 0) {
        status = 'out_of_stock';
      } else if (status !== 'maintenance' && status !== 'damaged') {
        status = 'available';
      }
  
      const { error } = await supabase
        .from("inventory")
        .update({
          name: selectedItem.name,
          quantity: selectedItem.quantity,
          remaining_quantity: remaining_quantity,
          status: status,
          description: selectedItem.description,
          category: selectedItem.category,
        })
        .eq("id", selectedItem.id);
  
      if (error) throw error;
      
      toast.success("Item updated successfully");
      setIsUpdateDialogOpen(false);
      fetchInventory();
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  // Modify the delete function to handle errors better
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      // Check if item is borrowed
      const { data: transactions } = await supabase
        .from("transactions")
        .select("id")
        .eq("inventory_id", id)
        .eq("status", "borrowed")
        .single();

      if (transactions) {
        toast.error("Cannot delete item that is currently borrowed");
        return;
      }

      const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Item deleted successfully");
      fetchInventory();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  // Add the update dialog to your JSX, just before the closing Card tag
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package size={20} />
            Inventory Management
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
              onClick={fetchInventory}
            >
              <RefreshCw size={16} className="mr-1" />
              Refresh
            </Button>
            {currentUser.role === "admin" && (  <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
            >
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>)}
          
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search inventory..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div 
                key={status} 
                className={`text-xs px-3 py-1 rounded-full border ${color} flex items-center gap-1 cursor-pointer`}
                onClick={() => setSearchTerm(status)}
              >
                <span>{statusIcons[status as keyof typeof statusIcons]}</span>
                <span className="capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Total Quantity</TableHead>
                <TableHead className="text-center">Available</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading inventory...
                  </TableCell>
                </TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">
                      <span className={item.remaining_quantity === 0 ? "text-red-500" : "text-green-500"}>
                        {item.remaining_quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                          {statusIcons[item.status]} {item.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsUpdateDialogOpen(true);
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total Items</TableCell>
                <TableCell colSpan={2} className="text-right">{filteredInventory.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </ScrollArea>
      </CardContent>
      
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Inventory Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={selectedItem?.name || ""}
                  onChange={(e) => setSelectedItem(prev => ({ ...prev!, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={selectedItem?.quantity || 0}
                  onChange={(e) => setSelectedItem(prev => ({ ...prev!, quantity: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedItem?.status}
                  onValueChange={(value: any) => setSelectedItem(prev => ({ ...prev!, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminInventoryTab;
