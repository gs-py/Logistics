export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  condition: 'Good' | 'Fair' | 'Poor';
  warrantyExpiry: string;
  status: 'Available' | 'Borrowed';
  borrowedBy?: string;
  returnDate?: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'assistant';
  name: string;
}

export interface BorrowRecord {
  id: string;
  itemId: string;
  borrowerId: string;
  borrowDate: string;
  returnDate: string;
  returned: boolean;
}