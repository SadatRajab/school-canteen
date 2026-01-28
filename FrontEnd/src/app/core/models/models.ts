// Product Model - Updated for Frontend-Only Architecture
export interface Product {
    // New frontend-only fields
    id: string;                    // UUID generated locally
    nameAr: string;
    nameEn: string;
    descriptionAr?: string;        // New field
    descriptionEn?: string;        // New field
    price: number;
    category?: string;
    imageDataUrl?: string;         // Base64 encoded image (replaces imageUrl)
    available: boolean;            // Renamed from isAvailable
    createdAt: Date;
    updatedAt: Date;

    // Legacy fields for backward compatibility (deprecated)
    _id?: string;                  // Legacy MongoDB ID
    descAr?: string;               // Legacy description
    descEn?: string;               // Legacy description
    imageUrl?: string;             // Legacy image URL
    isAvailable?: boolean;         // Legacy availability flag
}

// Cart Item
export interface CartItem {
    product: Product;
    quantity: number;
}

// Order Item (for creation)
export interface OrderItemRequest {
    productId: string;
    quantity: number;
}

// Order Item (from API)
export interface OrderItem {
    productId?: string;
    nameSnapshotAr: string;
    nameSnapshotEn: string;
    unitPriceSnapshot?: number;
    quantity: number;
    lineTotal?: number;
}

// Order Status
export type OrderStatus = 'PENDING' | 'PREPARING' | 'DELIVERED';

// Order Model
export interface Order {
    _id: string;
    orderNumber: number;
    orderDate: string;
    timezone: string;
    items: OrderItem[];
    totalPrice: number;
    totalAmount: number;
    paymentMethod: 'CASH';
    status: OrderStatus;
    preparingAt?: string;
    deliveredAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Kitchen Order (no prices)
export interface KitchenOrder {
    orderId: string;
    _id?: string; // Alias for orderId
    orderNumber: number;
    orderDate?: string;
    status: OrderStatus;
    createdAt: string;
    preparingAt?: string;
    totalAmount?: number;
    items: {
        nameSnapshotAr: string;
        nameSnapshotEn: string;
        quantity: number;
    }[];
}

// Create Order Request
export interface CreateOrderRequest {
    items: OrderItemRequest[];
    timezone?: string;
}

// Create Order Response
export interface CreateOrderResponse {
    success: boolean;
    data: Order;
}

// API Response wrapper
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    count?: number;
    message?: string;
}

// Admin Login
export interface AdminLoginRequest {
    email: string;
    password: string;
}

export interface AdminLoginResponse {
    success: boolean;
    token: string;
    admin: {
        email: string;
    };
}

// Profit Response
export interface ProfitResponse {
    success: boolean;
    data: {
        profit: number;
        deliveredOrdersCount?: number;
        revenueToday?: number;
        revenueTotal?: number;
        totalProfit?: number;
        ordersCount?: number;
    };
    date?: string;
    timezone?: string;
}

// Product Form
export interface ProductForm {
    nameAr: string;
    nameEn: string;
    descAr?: string;
    descEn?: string;
    price: number;
    category?: string;
    imageUrl?: string;
    isAvailable: boolean;
}

// Upload Response
export interface UploadResponse {
    success: boolean;
    url: string;
    imageUrl: string;
}
