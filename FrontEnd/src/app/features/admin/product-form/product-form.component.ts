import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { Product, ProductCategory, CreateProductDto, UpdateProductDto } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
    t!: Translation;
    productForm!: FormGroup;
    loading = false;
    isEditMode = false;
    selectedFile: File | null = null;
    imagePreview: string | null = null;

    // Available categories for dropdown
    categories = [
        { value: ProductCategory.SANDWICHES, labelEn: 'Sandwiches', labelAr: 'ساندويتشات' },
        { value: ProductCategory.DRINKS, labelEn: 'Drinks', labelAr: 'مشروبات' },
        { value: ProductCategory.SNACKS, labelEn: 'Snacks', labelAr: 'وجبات خفيفة' },
        { value: ProductCategory.DESSERTS, labelEn: 'Desserts', labelAr: 'حلويات' },
        { value: ProductCategory.HOT_MEALS, labelEn: 'Hot Meals', labelAr: 'وجبات ساخنة' }
    ];

    constructor(
        private fb: FormBuilder,
        private productService: ProductService,
        private i18n: I18nService,
        private snackBar: MatSnackBar,
        public dialogRef: MatDialogRef<ProductFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Product | null
    ) {
        this.isEditMode = !!data;
    }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        this.productForm = this.fb.group({
            nameAr: [this.data?.nameAr || '', Validators.required],
            nameEn: [this.data?.nameEn || '', Validators.required],
            descriptionAr: [this.data?.descriptionAr || ''],
            descriptionEn: [this.data?.descriptionEn || ''],
            price: [this.data?.price || 0, [Validators.required, Validators.min(0)]],
            category: [this.data?.category || ProductCategory.SANDWICHES, Validators.required],
            available: [this.data?.available ?? true]
        });

        // Set image preview if editing with existing image
        if (this.data?.imageDataUrl) {
            this.imagePreview = this.data.imageDataUrl;
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.snackBar.open('Please select an image file', this.t.close, { duration: 3000 });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.snackBar.open('Image size should be less than 5MB', this.t.close, { duration: 3000 });
                return;
            }

            this.selectedFile = file;

            // Generate preview
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    }

    async onSubmit() {
        if (this.productForm.invalid) {
            return;
        }

        this.loading = true;

        try {
            if (this.isEditMode && this.data) {
                // Update existing product
                const updateDto: UpdateProductDto = {
                    id: this.data.id,
                    ...this.productForm.value
                };

                // Add image file if new one selected
                if (this.selectedFile) {
                    updateDto.imageFile = this.selectedFile;
                }

                await this.productService.updateProduct(updateDto);
                this.snackBar.open(this.t.updateSuccess || 'Product updated successfully', this.t.close, { duration: 2000 });
            } else {
                // Create new product
                const createDto: CreateProductDto = {
                    ...this.productForm.value,
                    imageFile: this.selectedFile || undefined
                };

                await this.productService.createProduct(createDto);
                this.snackBar.open(this.t.createSuccess || 'Product created successfully', this.t.close, { duration: 2000 });
            }

            this.loading = false;
            this.dialogRef.close(true);
        } catch (error) {
            this.loading = false;
            console.error('Error saving product:', error);
            this.snackBar.open(this.t.error || 'An error occurred', this.t.close, { duration: 3000 });
        }
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
