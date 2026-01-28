import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Product } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartKey = 'canteen_cart';
    private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());

    cart$ = this.cartSubject.asObservable();

    constructor() { }

    private loadCart(): CartItem[] {
        const stored = localStorage.getItem(this.cartKey);
        return stored ? JSON.parse(stored) : [];
    }

    private saveCart(cart: CartItem[]): void {
        localStorage.setItem(this.cartKey, JSON.stringify(cart));
        this.cartSubject.next(cart);
    }

    addToCart(product: Product, quantity: number = 1): void {
        const cart = this.cartSubject.value;
        // Use new 'id' field (with fallback to legacy '_id')
        const productId = product.id || product._id || '';
        const existingItem = cart.find(item =>
            (item.product.id || item.product._id) === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ product, quantity });
        }

        this.saveCart(cart);
    }

    removeFromCart(productId: string): void {
        const cart = this.cartSubject.value.filter(item =>
            (item.product.id || item.product._id) !== productId
        );
        this.saveCart(cart);
    }

    updateQuantity(productId: string, quantity: number): void {
        const cart = this.cartSubject.value;
        const item = cart.find(i =>
            (i.product.id || i.product._id) === productId
        );

        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
    }

    clearCart(): void {
        this.saveCart([]);
    }

    getCart(): CartItem[] {
        return this.cartSubject.value;
    }

    getItemCount(): number {
        return this.cartSubject.value.reduce((sum, item) => sum + item.quantity, 0);
    }

    getEstimatedTotal(): number {
        return this.cartSubject.value.reduce(
            (sum, item) => sum + (item.product.price * item.quantity),
            0
        );
    }
}
