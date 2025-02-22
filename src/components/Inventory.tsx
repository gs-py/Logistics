import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
// import { getInventory, deleteItem } from "@/api/inventory";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import supabase from "@/service/supabase";
import { MdDelete } from "react-icons/md";
import { ScrollArea } from "./ui/scroll-area";

const AdminInventoryTab = () => {
  const [inventory, setInventory] = useState<null | object>([]);
  const statusColors = {
    borrowed: "text-yellow-500  ",
    available: "text-green-500 ",
    maintenance: "text-gray-500",
    damaged: "text-red-500 ",
  };
  useEffect(() => {
    fetchInventory();
  }, []);
  const fetchInventory = async () => {
    try {
      let { data, error } = await supabase.from("inventory").select("*");
      if (error) throw error;
      setInventory(data);
    } catch (error) {
      toast.error("Failed to load inventory");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // await deleteItem(id);
      toast.success("Item deleted");
      fetchInventory();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  return (
    <ScrollArea className="h-[80vh] w-[100%]">
      <Table className="text-white ">
        <TableHeader>
          <TableRow className="">
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {inventory.map((item) => (
            <TableRow key={item.id} className="">
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell className={`${statusColors[item.status]} `}>
                <span className="animate-pulse w-1 h-1 rounded-full  text-[5vw] px-2">
                  .
                </span>
                {item.status}
              </TableCell>
              <TableCell className="text-right contex">
                <Button onClick={() => handleDelete(item.id)}>Edit</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  <MdDelete className="text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total Items</TableCell>
            <TableCell className="text-right">{inventory.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </ScrollArea>
  );
};

export default AdminInventoryTab;
