export interface StatItem {
  id: number;
  label: string;
  value: number;
}

export interface ActivityItem {
  id: number;
  description: string;
  timestamp: string;
}

export let stats: StatItem[] = [
  { id: 1, label: "Total Items", value: 156 },
  { id: 2, label: "Low Stock Items", value: 8 },
  { id: 3, label: "Items Due Today", value: 3 },
  { id: 4, label: "Available Items", value: 142 },
];

export let recentActivities: ActivityItem[] = [
  { id: 1, description: "Item borrowed: Microscope #3", timestamp: "2 hours ago" },
  { id: 2, description: "Low stock alert: Glass Beakers", timestamp: "5 hours ago" },
  { id: 3, description: "Item returned: Digital Scale #2", timestamp: "Yesterday" },
];

export let itemsDue: ActivityItem[] = [
  { id: 1, description: "Microscope #3", timestamp: "Due today" },
  { id: 2, description: "pH Meter", timestamp: "Due tomorrow" },
  { id: 3, description: "Spectrophotometer", timestamp: "Due in 2 days" },
];

// Function to update a stat
export const updateStat = (id: number, newValue: number) => {
  const stat = stats.find((s) => s.id === id);
  if (stat) stat.value = newValue;
};

// Function to delete an activity
export const deleteActivity = (id: number) => {
  recentActivities = recentActivities.filter((activity) => activity.id !== id);
};

// Function to delete an item from "Items Due Soon"
export const deleteDueItem = (id: number) => {
  itemsDue = itemsDue.filter((item) => item.id !== id);
};
