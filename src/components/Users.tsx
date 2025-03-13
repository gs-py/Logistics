import React, { useEffect, useState } from "react";
import supabase from "@/service/supabase";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";

interface Borrower {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface BorrowerForm {
  name: string;
  email: string;
  phone: string;
}

export default function Users() {
  const [users, setUsers] = useState<Borrower[]>([]);
  const [form, setForm] = useState<BorrowerForm>({
    name: "",
    email: "",
    phone: "",
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("borrowers")
        .select("*")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Form validation
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { error } = await supabase.from("borrowers").insert([form]);
      if (error) throw error;

      toast.success("Borrower added successfully");
      await fetchUsers(); // Refresh the users list
      setForm({ name: "", email: "", phone: "" }); // Reset form
    } catch (error) {
      console.error("Error adding borrower:", error);
      toast.error("Failed to add borrower");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4 space-y-4 text-black">
        <Input
          placeholder="Borrower Name"
          value={form.name}
          name="name"
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          name="email"
          onChange={handleChange}
          required
        />
        <Input
          type="tel"
          placeholder="Phone"
          value={form.phone}
          name="phone"
          onChange={handleChange}
          required
        />
        <Button type="submit" className="w-full">
          Add Borrower
        </Button>
      </form>

      {users.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Registered Borrowers</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 border rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
