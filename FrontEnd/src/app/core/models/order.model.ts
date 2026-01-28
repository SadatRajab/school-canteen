export interface Order {
    id: string;
    orderNumber: number;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderItem {
    productId: string;
    productNameAr: string;
    productNameEn: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export enum OrderStatus {
    PENDING = 'PENDING',
    PREPARING = 'PREPARING',
    DELIVERED = 'DELIVERED'
}

export interface CreateOrderDto {
    items: OrderItem[];
    totalAmount: number;
}
