import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { I18nService, Translation } from '../../core/services/i18n.service';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { Product, CartItem } from '../../core/models/models';
import { CartComponent } from './cart/cart.component';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    t!: Translation;
    products: Product[] = [];
    loading = true;
    error = '';
    searchText = '';
    cartCount = 0;
    cartItems: CartItem[] = [];
    productQuantities: Map<string, number> = new Map();
    currentLang: string = 'en';

    constructor(
        private apiService: ApiService,
        private cartService: CartService,
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
                this.productQuantities.set(item.product._id, item.quantity);
            });
        });

        this.loadProducts();
    }

    loadProducts() {
        this.loading = true;
        this.apiService.getProducts(undefined, true).subscribe({
            next: (response) => {
                this.products = response.data;
                this.loading = false;
            },
            error: (err: any) => {
                this.error = this.t.error;
                this.loading = false;
            }
        });
    }

    getProductName(product: Product | CartItem): string {
        const p = 'product' in product ? product.product : product;
        return this.i18n.getBilingualField(p, 'name');
    }

    getProductDesc(product: Product): string {
        return this.i18n.getBilingualField(product, 'desc');
    }

    getProductQuantity(product: Product): number {
        return this.productQuantities.get(product._id) || 0;
    }

    increaseQuantity(product: Product) {
        const currentQty = this.getProductQuantity(product);
        this.cartService.addToCart(product, 1);
    }

    decreaseQuantity(product: Product) {
        const currentQty = this.getProductQuantity(product);
        if (currentQty > 0) {
            this.cartService.updateQuantity(product._id, currentQty - 1);
        }
    }

    updateQuantity(productId: string, newQuantity: number) {
        this.cartService.updateQuantity(productId, newQuantity);
    }

    removeItem(productId: string) {
        this.cartService.removeFromCart(productId);
    }

    checkout() {
        this.loading = true;
        const items = this.cartItems.map(item => ({
            productId: item.product._id,
            quantity: item.quantity
        }));

        console.log('Creating order with items:', items);

        this.apiService.createOrder({ items }).subscribe({
            next: (response) => {
                console.log('Order created successfully:', response);
                this.cartService.clearCart();
                this.loading = false;
                // Navigate using Router with query params
                this.router.navigate(['/menu/success'], {
                    queryParams: {
                        order: JSON.stringify(response.data)
                    }
                }).then(() => {
                    console.log('Navigation to success page completed');
                }).catch(err => {
                    console.error('Navigation error:', err);
                });
            },
            error: (err: any) => {
                console.error('Order creation error:', err);
                alert(this.t.error || 'Error placing order');
                this.loading = false;
            }
        });
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
        if (!p.imageUrl) {
            console.warn('No imageUrl for product:', p.nameEn);
            return 'assets/placeholder.png';
        }
        if (p.imageUrl.startsWith('http')) {
            return p.imageUrl;
        }
        const fullUrl = `http://localhost:5000${p.imageUrl}`;
        console.log('Image URL:', fullUrl);
        return fullUrl;
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
