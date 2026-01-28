import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { ProductFormComponent } from '../product-form/product-form.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-products-list',
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit, OnDestroy {
    t!: Translation;
    products: Product[] = [];
    displayedColumns = ['image', 'name', 'price', 'available', 'actions'];
    loading = true;
    private subscription?: Subscription;

    constructor(
        private productService: ProductService,
        private i18n: I18nService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        // Subscribe to products$ Observable for real-time updates
        this.subscription = this.productService.products$.subscribe({
            next: (products) => {
                this.products = products;
                this.loading = false;
            }
        });
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }

    getProductName(product: Product): string {
        return this.i18n.getBilingualField(product, 'name');
    }

    openCreateDialog() {
        const dialogRef = this.dialog.open(ProductFormComponent, {
            width: '90vw',
            maxWidth: '600px',
            maxHeight: '90vh',
            data: null
        });

        // No need to reload - BehaviorSubject auto-updates!
        dialogRef.afterClosed().subscribe();
    }

    openEditDialog(product: Product) {
        const dialogRef = this.dialog.open(ProductFormComponent, {
            width: '90vw',
            maxWidth: '600px',
            maxHeight: '90vh',
            data: product
        });

        // No need to reload - BehaviorSubject auto-updates!
        dialogRef.afterClosed().subscribe();
    }

    async deleteProduct(product: Product) {
        if (!confirm(this.t.confirmDelete)) {
            return;
        }

        try {
            await this.productService.deleteProduct(product.id);
            this.snackBar.open(this.t.deleteSuccess, this.t.close, { duration: 2000 });
        } catch (error) {
            this.snackBar.open(this.t.error, this.t.close, { duration: 3000 });
        }
    }

    getImageUrl(product: Product): string {
        // Use imageDataUrl from IndexedDB (Base64 encoded)
        if (product.imageDataUrl) {
            return product.imageDataUrl;
        }
        return 'assets/placeholder.jpg';
    }
}
