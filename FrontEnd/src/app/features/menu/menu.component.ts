import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { I18nService, Translation } from '../../core/services/i18n.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { OrderService } from '../../core/services/order.service';
import { Product, CartItem } from '../../core/models/models';
import { CartComponent } from './cart/cart.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {
    t!: Translation;
    products: Product[] = [];
    loading = true;
    error = '';
    searchText = '';
    cartCount = 0;
    cartItems: CartItem[] = [];
    productQuantities: Map<string, number> = new Map();
    currentLang: string = 'en';
    private subscription?: Subscription;

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private orderService: OrderService,
        private i18n: I18nService,
        private dialog: MatDialog,
        private router: Router
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe((lang) => {
            this.t = this.i18n.getTranslations();
            this.currentLang = lang;
        });

        this.cartService.cart$.subscribe((items) => {
            this.cartItems = items;
            this.cartCount = this.cartService.getItemCount();

            // Update product quantities map
            this.productQuantities.clear();
            items.forEach(item => {
                this.productQuantities.set(item.product.id, item.quantity);
            });
        });

        // Subscribe to available products from ProductService
        this.subscription = this.productService.products$.subscribe({
            next: (allProducts) => {
                // Only show available products in menu
                this.products = allProducts.filter(p => p.available);
                this.loading = false;
            },
            error: () => {
                this.error = this.t.error;
                this.loading = false;
            }
        });
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    getProductName(product: Product | CartItem): string {
        const p = 'product' in product ? product.product : product;
        return this.i18n.getBilingualField(p, 'name');
    }

    getProductDesc(product: Product): string {
        return this.i18n.getBilingualField(product, 'desc');
    }

    getProductQuantity(product: Product): number {
        return this.productQuantities.get(product.id) || 0;
    }

    increaseQuantity(product: Product) {
        const currentQty = this.getProductQuantity(product);
        this.cartService.addToCart(product, 1);
    }

    decreaseQuantity(product: Product) {
        const currentQty = this.getProductQuantity(product);
        if (currentQty > 0) {
            this.cartService.updateQuantity(product.id, currentQty - 1);
        }
    }

    updateQuantity(productId: string, newQuantity: number) {
        this.cartService.updateQuantity(productId, newQuantity);
    }

    removeItem(productId: string) {
        this.cartService.removeFromCart(productId);
    }

    async checkout() {
        if (this.cartItems.length === 0) return;

        this.loading = true;

        try {
            // Create order in OrderService (saves to IndexedDB)
            const order = await this.orderService.createOrder({
                items: this.cartItems.map(item => ({
                    productId: item.product.id || '',
                    productNameAr: item.product.nameAr,
                    productNameEn: item.product.nameEn,
                    quantity: item.quantity,
                    price: item.product.price,
                    subtotal: item.product.price * item.quantity
                })),
                totalAmount: this.total
            });

            console.log('Order created and saved:', order);

            // Clear cart
            this.cartService.clearCart();
            this.loading = false;

            // Navigate to success page with order data
            this.router.navigate(['/menu/success'], {
                queryParams: {
                    order: JSON.stringify(order)
                }
            }).then(() => {
                console.log('Navigation to success page completed');
            }).catch(err => {
                console.error('Navigation error:', err);
            });
        } catch (error) {
            console.error('Failed to create order:', error);
            this.loading = false;
            alert('Failed to create order. Please try again.');
        }
    }

    get subtotal(): number {
        return this.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }

    get total(): number {
        return this.subtotal;
    }

    toggleLanguage() {
        this.i18n.toggleLanguage();
    }

    openCart() {
        this.dialog.open(CartComponent, {
            width: '600px',
            maxWidth: '95vw'
        });
    }

    get filteredProducts(): Product[] {
        if (!this.searchText) return this.products;

        const search = this.searchText.toLowerCase();
        return this.products.filter(p =>
            p.nameAr.toLowerCase().includes(search) ||
            p.nameEn.toLowerCase().includes(search)
        );
    }

    getImageUrl(product: Product | CartItem): string {
        const p = 'product' in product ? product.product : product;

        // Use imageDataUrl from IndexedDB (Base64 encoded)
        if (p.imageDataUrl) {
            return p.imageDataUrl;
        }

        console.warn('No image for product:', p.nameEn);
        return 'assets/placeholder.png';
    }

    openCartDialog() {
        this.dialog.open(CartComponent, {
            width: '95vw',
            maxWidth: '500px',
            maxHeight: '90vh',
            panelClass: 'cart-dialog'
        });
    }
}
