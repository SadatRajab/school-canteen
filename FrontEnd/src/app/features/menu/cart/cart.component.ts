import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ApiService } from '../../../core/services/api.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { CartItem, CreateOrderRequest } from '../../../core/models/models';

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
        private apiService: ApiService,
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
        if (!product.imageUrl) return 'assets/placeholder.png';
        if (product.imageUrl.startsWith('http')) return product.imageUrl;
        return `http://localhost:5000${product.imageUrl}`;
    }

    checkout() {
        if (this.cartItems.length === 0) return;

        this.loading = true;

        const orderRequest: CreateOrderRequest = {
            items: this.cartItems.map(item => ({
                productId: item.product._id,
                quantity: item.quantity
            }))
        };

        this.apiService.createOrder(orderRequest).subscribe({
            next: (response) => {
                this.cartService.clearCart();
                this.dialogRef.close();
                this.loading = false;
                this.router.navigate(['/menu/success'], {
                    queryParams: { order: JSON.stringify(response.data) }
                });
            },
            error: (err) => {
                this.loading = false;
                this.snackBar.open(this.t.orderError, this.t.close, { duration: 3000 });
            }
        });
    }
}
