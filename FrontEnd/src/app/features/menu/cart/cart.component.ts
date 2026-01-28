import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { CartItem } from '../../../core/models/models';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
    t!: Translation;
    cartItems: CartItem[] = [];
    total = 0;
    loading = false;

    constructor(
        private cartService: CartService,
        private orderService: OrderService,
        private i18n: I18nService,
        private dialogRef: MatDialogRef<CartComponent>,
        private snackBar: MatSnackBar,
        private router: Router
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        this.cartService.cart$.subscribe(items => {
            this.cartItems = items;
            this.total = this.cartService.getEstimatedTotal();
        });
    }

    getProductName(item: CartItem): string {
        return this.i18n.getBilingualField(item.product, 'name');
    }

    updateQuantity(productId: string, quantity: number) {
        this.cartService.updateQuantity(productId, quantity);
    }

    removeItem(productId: string) {
        this.cartService.removeFromCart(productId);
    }

    getImageUrl(item: CartItem): string {
        const product = item.product;
        // Use imageDataUrl from IndexedDB (Base64 encoded)
        if (product.imageDataUrl) {
            return product.imageDataUrl;
        }
        return 'assets/placeholder.png';
    }

    async checkout() {
        if (this.cartItems.length === 0) return;

        this.loading = true;

        try {
            // Create order in OrderService (saves to IndexedDB)
            const order = await this.orderService.createOrder({
                items: this.cartItems.map(item => ({
                    productId: item.product.id || item.product._id || '',
                    productNameAr: item.product.nameAr,
                    productNameEn: item.product.nameEn,
                    quantity: item.quantity,
                    price: item.product.price,
                    subtotal: item.product.price * item.quantity
                })),
                totalAmount: this.total
            });

            console.log('Order created from cart:', order);

            // Clear cart and close dialog
            this.cartService.clearCart();
            this.dialogRef.close();
            this.loading = false;

            // Navigate to success page
            this.router.navigate(['/menu/success'], {
                queryParams: { order: JSON.stringify(order) }
            });
        } catch (error) {
            console.error('Failed to create order:', error);
            this.loading = false;
            this.snackBar.open(this.t.error || 'Failed to create order', this.t.close, { duration: 3000 });
        }
    }
}
