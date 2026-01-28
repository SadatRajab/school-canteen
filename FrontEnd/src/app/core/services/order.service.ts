import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';
import { Order, OrderItem, OrderStatus, CreateOrderDto } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private ordersSubject = new BehaviorSubject<Order[]>([]);
    public orders$ = this.ordersSubject.asObservable();
    private initialized = false;

    constructor(private indexedDB: IndexedDBService) {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Load existing orders from IndexedDB
            const orders = await this.indexedDB.getAll<Order>('orders');

            // Sort by creation date (newest first)
            const sortedOrders = orders.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            this.ordersSubject.next(sortedOrders);
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize orders:', error);
            this.ordersSubject.next([]);
        }
    }

    // Get next order number
    private getNextOrderNumber(): number {
        const orders = this.ordersSubject.value;
        if (orders.length === 0) return 1;

        const maxOrderNumber = Math.max(...orders.map(o => o.orderNumber));
        return maxOrderNumber + 1;
    }

    // Generate unique ID
    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Create new order
    async createOrder(dto: CreateOrderDto): Promise<Order> {
        await this.initialize();

        const order: Order = {
            id: this.generateId(),
            orderNumber: this.getNextOrderNumber(),
            items: dto.items,
            totalAmount: dto.totalAmount,
            status: OrderStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await this.indexedDB.add('orders', order);

        const updatedOrders = [order, ...this.ordersSubject.value];
        this.ordersSubject.next(updatedOrders);

        return order;
    }

    // Update order status
    async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
        await this.initialize();

        const orders = this.ordersSubject.value;
        const orderIndex = orders.findIndex(o => o.id === orderId);

        if (orderIndex === -1) {
            throw new Error('Order not found');
        }

        const updatedOrder: Order = {
            ...orders[orderIndex],
            status,
            updatedAt: new Date()
        };

        await this.indexedDB.update('orders', updatedOrder);

        const updatedOrders = [...orders];
        updatedOrders[orderIndex] = updatedOrder;
        this.ordersSubject.next(updatedOrders);

        return updatedOrder;
    }

    // Get orders by status
    getOrdersByStatus(status: OrderStatus): Order[] {
        return this.ordersSubject.value.filter(o => o.status === status);
    }

    // Get pending orders count
    getPendingOrdersCount(): number {
        return this.ordersSubject.value.filter(o => o.status === OrderStatus.PENDING).length;
    }

    // Get today's orders
    getTodayOrders(): Order[] {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.ordersSubject.value.filter(o => {
            const orderDate = new Date(o.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === today.getTime();
        });
    }

    // Get today's revenue
    getTodayRevenue(): number {
        const todayOrders = this.getTodayOrders();
        return todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    }

    // Get all orders
    async getAllOrders(): Promise<Order[]> {
        await this.initialize();
        return this.ordersSubject.value;
    }

    // Clear all orders (for demo reset)
    async clearAllOrders(): Promise<void> {
        await this.indexedDB.clear('orders');
        this.ordersSubject.next([]);
    }
}
