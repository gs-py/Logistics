import React, { useEffect, useState } from "react";
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
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { 
  Search, 
  RefreshCw, 
  UserPlus, 
  Calendar, 
  Mail, 
  Phone,
  Download
} from "lucide-react";
import { Badge } from "./ui/badge";

interface Borrower {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

const Students = () => {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Borrower[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchBorrowers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        borrowers.filter(
          (user) =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(borrowers);
    }
  }, [searchTerm, borrowers]);

  const fetchBorrowers = async () => {
    try {
      setIsLoading(true);
      let { data, error } = await supabase.from("borrowers").select("*");
      if (error) throw error;
      setBorrowers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      toast.error("Failed to load borrowers");
      console.error("Error fetching borrowers:", error);
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

  const exportToCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Created At'];
    const csvData = filteredUsers.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone || 'N/A',
      new Date(user.created_at).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `borrowers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="shadow-md border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Borrowers Management
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
              onClick={fetchBorrowers}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/20 text-white hover:bg-white/30 border-white/40"
              onClick={exportToCsv}
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search borrowers..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {filteredUsers.length} borrowers
            </Badge>
            {searchTerm && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Search: "{searchTerm}"
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-300px)] rounded-md border">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <RefreshCw size={24} className="animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading borrowers...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <UserPlus size={14} />
                      Name
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Mail size={14} />
                      Email
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Phone size={14} />
                      Phone
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      Created At
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                      {searchTerm ? 'No borrowers match your search' : 'No borrowers found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((borrower) => (
                    <TableRow key={borrower.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-medium">
                            {borrower.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {borrower.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a href={`mailto:${borrower.email}`} className="text-blue-600 hover:underline">
                          {borrower.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a href={`tel:${borrower.phone}`} className="text-blue-600 hover:underline">
                          {borrower.phone || "N/A"}
                        </a>
                      </TableCell>
                      <TableCell>
                        {borrower.created_at ? formatDate(borrower.created_at) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total Borrowers</TableCell>
                  <TableCell className="text-right font-medium">{borrowers.length}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Students;
