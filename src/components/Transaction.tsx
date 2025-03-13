import { useEffect, useState } from "react";
import supabase from "@/service/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";

interface Transaction {
  id: string;
  inventory: { name: string }[];
  borrow_date: string;
  return_date: string | null;
  status: "borrowed" | "returned" | "overdue";
  borrowers: { name: string }[];
}
const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      let { data, error } = await supabase
        .from("transactions")
        .select(
          "id, borrow_date, return_date, status, borrowers(name), inventory(name)"
        )
        .order("borrow_date", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast.error("Failed to load transactions");
    }
  };

  const getStatusColor = (status: "borrowed" | "returned" | "overdue") => {
    switch (status) {
      case "borrowed":
        return "text-yellow-500";
      case "returned":
        return "text-green-500";
      case "overdue":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Transactions</h2>
      <Table className="rounded-md">
        <TableHeader>
          <TableRow className="bg-black text-gray-400">
            <TableHead>Borrower</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Borrow Date</TableHead>
            <TableHead>Return Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-black text-white">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.borrowers[0]?.name || "Unknown"}</TableCell>
                <TableCell>{tx.inventory[0]?.name || "Unknown"}</TableCell>
                <TableCell>
                  {new Date(tx.borrow_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {tx.return_date
                    ? new Date(tx.return_date).toLocaleDateString()
                    : "Pending"}
                </TableCell>
                <TableCell className={getStatusColor(tx.status)}>
                  {tx.status}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Transactions;
