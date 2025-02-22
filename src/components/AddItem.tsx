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

const BorrowItem = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    borrower_id: "",
    inventory_id: "",
    return_date: "",
  });

  useEffect(() => {
    fetchBorrowers();
    fetchInventory();
  }, []);

  const fetchBorrowers = async () => {
    let { data, error } = await supabase.from("borrowers").select("id, name");
    if (error) {
      toast.error("Failed to load borrowers");
    } else {
      setBorrowers(data);
      setFilteredBorrowers(data);
    }
  };

  const fetchInventory = async () => {
    let { data, error } = await supabase
      .from("inventory")
      .select("id, name")
      .eq("status", "available");
    if (error) {
      toast.error("Failed to load inventory");
    } else {
      setInventory(data);
    }
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    setFilteredBorrowers(
      borrowers.filter((b) => b.name.toLowerCase().includes(searchTerm))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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
    } catch (error) {
      toast.error("Failed to process transaction");
    }
  };

  return (
    <div className="bg-gray-800  p-3  rounded-lg w-[70vw]">
      <h2 className="text-xl font-bold mb-4 text-white">Borrow an Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          onValueChange={(value) => setForm({ ...form, borrower_id: value })}
        >
          <SelectTrigger className="text-white/70">
            <SelectValue placeholder="Select Borrower" />
          </SelectTrigger>
          <SelectContent className="bg-gray-200 text-black">
            <Input
              placeholder="Search Borrower..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-2 py-1 mb-2 text-black"
            />
            {filteredBorrowers.length > 0 ? (
              filteredBorrowers.map((b) => (
                <SelectItem key={b.id} value={b.id.toString()}>
                  {b.name}
                </SelectItem>
              ))
            ) : (
              <p className="px-2 py-1 text-gray-500">No results found</p>
            )}
          </SelectContent>
        </Select>

        {/* Inventory Selection */}
        <Select
          onValueChange={(value) => setForm({ ...form, inventory_id: value })}
        >
          <SelectTrigger className="text-white/70">
            <SelectValue placeholder="Select Item" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black">
            {inventory.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          className="text-white/70"
          type="date"
          value={form.return_date}
          onChange={(e) => setForm({ ...form, return_date: e.target.value })}
        />

        <Button type="submit" className="bg-blue-700 text-white">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default BorrowItem;
