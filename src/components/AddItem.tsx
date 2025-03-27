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
import { Calendar, Package, User, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Borrower {
  id: number;
  name: string;
}

interface InventoryItem {
  id: number;
  name: string;
}

interface BorrowForm {
  borrower_id: string;
  inventory_id: string;
  return_date: string;
}

const BorrowItem = () => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState<BorrowForm>({
    borrower_id: "",
    inventory_id: "",
    return_date: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBorrowers();
    fetchInventory();
  }, []);

  const fetchBorrowers = async () => {
    try {
      setIsLoading(true);
      let { data, error } = await supabase.from("borrowers").select("id, name");
      if (error) throw error;
      setBorrowers(data || []);
      setFilteredBorrowers(data || []);
    } catch (error) {
      toast.error("Failed to load borrowers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      let { data, error } = await supabase
        .from("inventory")
        .select("id, name")
        .eq("status", "available");
      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    setFilteredBorrowers(
      borrowers.filter((b) => b.name.toLowerCase().includes(searchTerm))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.borrower_id || !form.inventory_id || !form.return_date) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabase.from("transactions").insert([
        {
          borrower_id: form.borrower_id,
          inventory_id: form.inventory_id,
          return_date: form.return_date,
          status: "borrowed",
        },
      ]);

      if (error) throw error;

      await supabase
        .from("inventory")
        .update({ status: "borrowed" })
        .eq("id", form.inventory_id);
        
      toast.success("Item borrowed successfully");
      setForm({ borrower_id: "", inventory_id: "", return_date: "" });
      fetchInventory(); // Refresh inventory list
    } catch (error) {
      toast.error("Failed to process transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Package size={20} />
          Borrow an Item
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Borrower</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Select
                value={form.borrower_id}
                onValueChange={(value) => setForm({ ...form, borrower_id: value })}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue placeholder="Select Borrower" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <div className="p-2">
                    <Input
                      placeholder="Search Borrower..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="mb-2"
                    />
                  </div>
                  {filteredBorrowers.length > 0 ? (
                    filteredBorrowers.map((b) => (
                      <SelectItem key={b.id} value={b.id.toString()}>
                        {b.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-gray-500">
                      No results found
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Item</label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Select
                value={form.inventory_id}
                onValueChange={(value) => setForm({ ...form, inventory_id: value })}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[200px]">
                  {inventory.length > 0 ? (
                    inventory.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-center text-gray-500">
                      No available items
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Return Date</label>
            <div className="relative">
              <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="date"
                className="pl-10"
                value={form.return_date}
                onChange={(e) => setForm({ ...form, return_date: e.target.value })}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Submit Borrow Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BorrowItem;
