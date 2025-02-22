import React, { useEffect, useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import supabase from "@/service/supabase";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";

export default function Users() {
  const [users, setUsers] = useState([]); // ✅ Initialize as an empty array
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("borrowers").select("*");
        if (error) throw error;
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("borrowers").insert([form]);
      if (error) throw error;
      toast.success("Borrower added");
      fetchBorrowers();
      setForm({ name: "", email: "", phone: "" });
    } catch (error) {
      toast.error("Failed to add borrower");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2  text-black">
        <Input
          placeholder="Borrower Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <Button type="submit">Add Borrower</Button>
      </form>
    </div>
  );
}
