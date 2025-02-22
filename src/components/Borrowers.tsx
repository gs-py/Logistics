import React, { FormEventHandler, useEffect, useState } from "react";
import supabase from "@/service/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import { MdSearch } from "react-icons/md";
import { ScrollArea } from "./ui/scroll-area";

const Students = () => {
  const [borrowers, setBorrowers] = useState([]);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  const fetchBorrowers = async () => {
    try {
      let { data, error } = await supabase.from("borrowers").select("*");
      if (error) throw error;
      setBorrowers(data);
    } catch (error) {
      toast.error("Failed to load borrowers");
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = borrowers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className=" px-4">
      <h2 className="text-xl font-bold mb-4">Borrowers Management</h2>
      <div className="mb-6">
        <div className="relative">
          <MdSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <ScrollArea className="h-[67vh]">
        {" "}
        <Table className="text-white px-1">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((borrower) => (
              <TableRow key={borrower.id}>
                <TableCell>{borrower.name}</TableCell>
                <TableCell>{borrower.email}</TableCell>
                <TableCell>{borrower.phone || "N/A"}</TableCell>
                <TableCell>
                  {new Date(borrower.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total Borrowers</TableCell>
              <TableCell className="text-right">{borrowers.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default Students;
