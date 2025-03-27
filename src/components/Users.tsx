import React, { useEffect, useState } from "react";
import supabase from "@/service/supabase";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import { 
  Users as UsersIcon, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  User, 
  Trash2, 
  RefreshCw 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";

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
  const [filteredUsers, setFilteredUsers] = useState<Borrower[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<BorrowerForm>({
    name: "",
    email: "",
    phone: "",
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("borrowers")
        .select("*")
        .order("name");

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Form validation
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.from("borrowers").insert([form]);
      if (error) throw error;

      toast.success("Borrower added successfully");
      await fetchUsers(); // Refresh the users list
      setForm({ name: "", email: "", phone: "" }); // Reset form
      setIsAdding(false);
    } catch (error) {
      console.error("Error adding borrower:", error);
      toast.error("Failed to add borrower");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this borrower?")) {
      try {
        setIsLoading(true);
        const { error } = await supabase.from("borrowers").delete().eq("id", id);
        if (error) throw error;
        toast.success("Borrower deleted successfully");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting borrower:", error);
        toast.error("Failed to delete borrower");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card className="shadow-md border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <UsersIcon size={20} />
            User Management
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
              onClick={fetchUsers}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
              onClick={() => setIsAdding(!isAdding)}
            >
              <UserPlus size={16} className="mr-1" />
              {isAdding ? 'Cancel' : 'Add User'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {isAdding && (
          <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
              <UserPlus size={18} className="mr-2" />
              Add New Borrower
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Full Name"
                    value={form.name}
                    name="name"
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    name="email"
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    name="phone"
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Borrower'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search users by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 p-2 rounded-lg text-sm mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-600">
            <UsersIcon size={16} />
            <span>Total Users: {filteredUsers.length}</span>
          </div>
          {searchTerm && (
            <div className="text-blue-600">
              Showing results for "{searchTerm}"
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[calc(85vh-250px)] rounded-md">
          {isLoading && !isAdding ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw size={24} className="animate-spin text-blue-600" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              {searchTerm ? 'No users match your search' : 'No users found. Add some users to get started.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.id}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                        {user.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400" />
                      <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline">
                        {user.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
