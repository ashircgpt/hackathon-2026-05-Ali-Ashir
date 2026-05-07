// Shared TypeScript types for Pizza3.14
// All DB-backed types mirror the Prisma schema (prisma/schema.prisma).

export type OrderStatus = "NEW" | "PREPARING" | "BAKING" | "READY" | "SERVED";
export type LayerType = "BASE" | "SAUCE" | "CHEESE" | "TOPPING";

export interface MenuItem {
  id: number;
  name: string;
  layerType: LayerType;
  imageUrl: string;
  price: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  sortOrder: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface OrderLayer {
  id: number;
  orderId: number;
  menuItemId: number;
  zIndex: number; // server-assigned: BASE=0, SAUCE=1, CHEESE=2, TOPPING=3+n
  menuItem: MenuItem;
}

export interface Order {
  id: number;
  tableId: number;
  status: OrderStatus;
  totalPrice: number; // snapshot at order time
  totalCals: number;  // snapshot at order time
  createdAt: string;
  updatedAt: string;
  layers: OrderLayer[];
  feedback?: Feedback;
}

export interface Feedback {
  id: number;
  orderId: number;
  content: string;
  contentHash: string;  // SHA256(content)
  prevHash: string;     // blockHash of previous block, or "0"
  timestamp: string;    // ISO 8601 UTC
  blockHash: string;    // SHA256(prevHash + timestamp + contentHash)
  createdAt: string;
}

export interface NutritionTotals {
  price: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

// API response shapes
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface CreateOrderPayload {
  tableId: number;
  layers: number[]; // array of menuItem IDs
}

export interface SubmitFeedbackPayload {
  orderId: number;
  content: string;
}

export interface AdvanceStatusResponse {
  id: number;
  status: OrderStatus;
}

// Status display metadata (used by StatusBadge)
export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string }
> = {
  NEW: { label: "New", color: "slate" },
  PREPARING: { label: "Preparing", color: "yellow" },
  BAKING: { label: "Baking", color: "orange" },
  READY: { label: "Ready", color: "green" },
  SERVED: { label: "Served", color: "teal" },
};

export const STATUS_SEQUENCE: OrderStatus[] = [
  "NEW",
  "PREPARING",
  "BAKING",
  "READY",
  "SERVED",
];
