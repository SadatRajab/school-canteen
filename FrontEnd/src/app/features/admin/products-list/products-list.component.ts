import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { Product } from '../../../core/models/models';
import { ProductFormComponent } from '../product-form/product-form.component';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-products-list',
    templateUrl: './products-list.component.html',
    styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
    t!: Translation;
    products: Product[] = [];
    displayedColumns = ['image', 'name', 'price', 'available', 'actions'];
    loading = true;

    constructor(
        private apiService: ApiService,
        private i18n: I18nService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        this.loadProducts();
    }

    loadProducts() {
        this.apiService.getProducts().subscribe({
            next: (response) => {
                this.products = response.data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    getProductName(product: Product): string {
        return this.i18n.getBilingualField(product, 'name');
    }

    openCreateDialog() {
        const dialogRef = this.dialog.open(ProductFormComponent, {
            width: '600px',
            data: null
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadProducts();
            }
        });
    }

    openEditDialog(product: Product) {
        const dialogRef = this.dialog.open(ProductFormComponent, {
            width: '600px',
            data: product
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadProducts();
            }
        });
    }

    deleteProduct(product: Product) {
        if (!confirm(this.t.confirmDelete)) {
            return;
        }

        this.apiService.deleteProduct(product._id).subscribe({
            next: () => {
                this.snackBar.open(this.t.deleteSuccess, this.t.close, { duration: 2000 });
                this.loadProducts();
            },
            error: () => {
                this.snackBar.open(this.t.error, this.t.close, { duration: 3000 });
            }
        });
    }

    getImageUrl(product: Product): string {
        if (!product.imageUrl) return 'assets/placeholder.jpg';
        if (product.imageUrl.startsWith('http')) return product.imageUrl;
        return `${environment.uploadsUrl}${product.imageUrl}`;
    }
}
