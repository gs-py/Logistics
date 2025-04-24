import { useEffect, useState } from "react";
import supabase from "@/service/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "./ui/badge";
import { ShoppingCart, Package, User, RefreshCw, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CartRequest {
  id: number;
  borrower_id: number;
  status: string;
  admin_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  borrower: {
    id: number;
    name: string;
    email: string;
  };
  items: CartItem[];
}

interface CartItem {
  id: number;
  cart_id: number;
  inventory_id: number;
  quantity: number;
  created_at: string;
  inventory: {
    id: number;
    name: string;
    remaining_quantity: number;
  };
}

interface CartRequestsProps {
  currentUser: {
    role: string;
    name: string;
    status?: string;
  } | null;
  onRequestProcessed: () => void;
}

const CartRequests = ({ currentUser, onRequestProcessed }: CartRequestsProps) => {
  const [cartRequests, setCartRequests] = useState<CartRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("requested");

  useEffect(() => {
    fetchCartRequests();
  }, [activeTab]);

  const fetchCartRequests = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("cart")
        .select(`
          *,
          borrower:borrower_id (id, name, email),
          items:cart_items (
            id, cart_id, inventory_id, quantity,
            inventory:inventory_id (id, name, remaining_quantity)
          )
        `)
        .eq("status", activeTab)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setCartRequests(data || []);
    } catch (error) {
      toast.error("Failed to load cart requests");
      console.error("Error fetching cart requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (cartId: number) => {
    try {
      setIsLoading(true);
      
      // Get cart items
      const { data: cartItems, error: itemsError } = await supabase
        .from("cart_items")
        .select("inventory_id, quantity, inventory:inventory_id (remaining_quantity)")
        .eq("cart_id", cartId);
      
      if (itemsError) throw itemsError;
      
      // Check if all items have sufficient quantity
      const insufficientItems = cartItems?.filter(
        item => (item.inventory?.remaining_quantity || 0) < item.quantity
      );
      
      if (insufficientItems && insufficientItems.length > 0) {
        toast.error("Some items don't have sufficient quantity available");
        return;
      }
      
      // Begin transaction
      for (const item of (cartItems || [])) {
        // Create transaction record
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert({
            borrower_id: cartRequests.find(r => r.id === cartId)?.borrower_id,
            inventory_id: item.inventory_id,
            status: "borrowed",
            quantity: item.quantity,
            return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
          });
        
        if (transactionError) throw transactionError;
        
        // Update inventory
        const newRemainingQuantity = (item.inventory?.remaining_quantity || 0) - item.quantity;
        const { error: inventoryError } = await supabase
          .from("inventory")
          .update({
            remaining_quantity: newRemainingQuantity,
            status: newRemainingQuantity === 0 ? 'out_of_stock' : 'borrowed'
          })
          .eq("id", item.inventory_id);
        
        if (inventoryError) throw inventoryError;
      }
      
      // Update cart status
      const { error: cartError } = await supabase
        .from("cart")
        .update({
          status: "accepted",
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", cartId);
      
      if (cartError) throw cartError;
      
      toast.success("Cart request accepted successfully");
      fetchCartRequests();
      onRequestProcessed();
    } catch (error) {
      toast.error("Failed to process cart request");
      console.error("Error accepting cart request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (cartId: number) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("cart")
        .update({
          status: "rejected",
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", cartId);
      
      if (error) throw error;
      
      toast.success("Cart request rejected");
      fetchCartRequests();
      onRequestProcessed();
    } catch (error) {
      toast.error("Failed to reject cart request");
      console.error("Error rejecting cart request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "requested":
        return <Badge className="bg-blue-100 text-blue-800">Requested</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ShoppingCart size={20} />
          Cart Requests
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="requested" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="requested">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <ScrollArea className="h-[calc(100vh-300px)] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Borrower</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Status</TableHead>
                    {activeTab === "requested" && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <RefreshCw size={24} className="animate-spin mx-auto text-blue-600" />
                        <p className="mt-2 text-gray-500">Loading requests...</p>
                      </TableCell>
                    </TableRow>
                  ) : cartRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                        No {activeTab} cart requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    cartRequests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center text-blue-700 font-medium">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="font-medium">{request.borrower?.name}</p>
                              <p className="text-xs text-gray-500">{request.borrower?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {request.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-1 text-sm">
                                <Package size={12} className="text-gray-400" />
                                <span className="font-medium">{item.inventory?.name}</span>
                                <span className="text-gray-500">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(request.created_at)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(request.status)}
                        </TableCell>
                        {activeTab === "requested" && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleAccept(request.id)}
                                disabled={isLoading}
                              >
                                <Check size={16} className="mr-1" />
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleReject(request.id)}
                                disabled={isLoading}
                              >
                                <X size={16} className="mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CartRequests;