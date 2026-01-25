import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { Product } from '../../../core/models/models';

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

    constructor(
        private fb: FormBuilder,
        private apiService: ApiService,
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
            price: [this.data?.price || 0, [Validators.required, Validators.min(0)]],
            isAvailable: [this.data?.isAvailable ?? true]
        });

        if (this.data?.imageUrl) {
            this.imagePreview = this.data.imageUrl;
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;

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
        let imageUrl = this.data?.imageUrl || '';

        // Upload image if new file selected
        if (this.selectedFile) {
            try {
                const uploadResponse = await this.apiService.uploadImage(this.selectedFile).toPromise();
                imageUrl = uploadResponse?.url || uploadResponse?.imageUrl || '';
            } catch (err) {
                this.loading = false;
                this.snackBar.open(this.t.imageUploadFailed, this.t.close, { duration: 3000 });
                return;
            }
        }

        const productData = {
            ...this.productForm.value,
            imageUrl
        };

        const request = this.isEditMode
            ? this.apiService.updateProduct(this.data!._id, productData)
            : this.apiService.createProduct(productData);

        request.subscribe({
            next: () => {
                this.loading = false;
                const message = this.isEditMode ? this.t.updateSuccess : this.t.createSuccess;
                this.snackBar.open(message, this.t.close, { duration: 2000 });
                this.dialogRef.close(true);
            },
            error: () => {
                this.loading = false;
                this.snackBar.open(this.t.error, this.t.close, { duration: 3000 });
            }
        });
    }

    onCancel() {
        this.dialogRef.close(false);
    }
}
