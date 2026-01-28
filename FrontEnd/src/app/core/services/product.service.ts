import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product, CreateProductDto, UpdateProductDto, ProductCategory } from '../models/product.model';
import { IndexedDBService } from './indexeddb.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private productsSubject = new BehaviorSubject<Product[]>([]);
    public products$ = this.productsSubject.asObservable();

    private initialized = false;

    constructor(private indexedDB: IndexedDBService) {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            const products = await this.indexedDB.getAll<Product>('products');

            // Add demo products if empty
            if (products.length === 0) {
                await this.seedDemoProducts();
            } else {
                this.productsSubject.next(products);
            }

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize products:', error);
            this.productsSubject.next([]);
        }
    }

    private async seedDemoProducts(): Promise<void> {
        const demoProducts: Product[] = [
            {
                id: this.generateId(),
                nameAr: 'بيتزا',
                nameEn: 'Pizza',
                descriptionAr: 'بيتزا ساخنة طازجة',
                descriptionEn: 'Fresh hot pizza',
                price: 3,
                category: ProductCategory.HOT_MEALS,
                imageDataUrl: 'assets/images/بيتزا.jpg',
                available: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: this.generateId(),
                nameAr: 'كرواسون',
                nameEn: 'Croissant',
                descriptionAr: 'كرواسون بالزبدة الطازجة',
                descriptionEn: 'Fresh butter croissant',
                price: 2,
                category: ProductCategory.SANDWICHES,
                imageDataUrl: 'assets/images/كرواسون.jpg',
                available: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: this.generateId(),
                nameAr: 'عصير',
                nameEn: 'Juice',
                descriptionAr: 'عصير طبيعي منعش',
                descriptionEn: 'Fresh natural juice',
                price: 2,
                category: ProductCategory.DRINKS,
                imageDataUrl: 'assets/images/عصير.jpg',
                available: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: this.generateId(),
                nameAr: 'ماء',
                nameEn: 'Water',
                descriptionAr: 'مياه معدنية',
                descriptionEn: 'Mineral water',
                price: 1,
                category: ProductCategory.DRINKS,
                imageDataUrl: 'assets/images/ماية.jpg',
                available: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: this.generateId(),
                nameAr: 'شبسي',
                nameEn: 'Chips',
                descriptionAr: 'شبسي مقرمش بنكهات متنوعة',
                descriptionEn: 'Crispy chips with various flavors',
                price: 1,
                category: ProductCategory.SNACKS,
                imageDataUrl: 'assets/images/شبسي.jpg',
                available: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: this.generateId(),
                nameAr: 'شوكولاتة',
                nameEn: 'Chocolate',
                descriptionAr: 'شوكولاتة لذيذة',
                descriptionEn: 'Delicious chocolate',
                price: 2,
                category: ProductCategory.DESSERTS,
                imageDataUrl: 'assets/images/شكولاتة.jpg',
                available: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: this.generateId(),
                nameAr: 'زبادي',
                nameEn: 'Yogurt',
                descriptionAr: 'زبادي طازج',
                descriptionEn: 'Fresh yogurt',
                price: 2,
                category: ProductCategory.DESSERTS,
                imageDataUrl: 'assets/images/زبادي.jpg',
                available: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        for (const product of demoProducts) {
            await this.indexedDB.add('products', product);
        }

        this.productsSubject.next(demoProducts);
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Get all products
    async getAllProducts(): Promise<Product[]> {
        await this.initialize();
        return this.productsSubject.value;
    }

    // Get available products only
    async getAvailableProducts(): Promise<Product[]> {
        await this.initialize();
        return this.productsSubject.value.filter(p => p.available);
    }

    // Get product by ID
    async getProductById(id: string): Promise<Product | undefined> {
        await this.initialize();
        return this.productsSubject.value.find(p => p.id === id);
    }

    // Create product
    async createProduct(dto: CreateProductDto): Promise<Product> {
        await this.initialize();

        const product: Product = {
            id: this.generateId(),
            nameAr: dto.nameAr,
            nameEn: dto.nameEn,
            descriptionAr: dto.descriptionAr,
            descriptionEn: dto.descriptionEn,
            price: dto.price,
            category: dto.category,
            available: dto.available !== undefined ? dto.available : true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Handle image if provided
        if (dto.imageFile) {
            try {
                const dataUrl = await this.indexedDB.saveImage(product.id, dto.imageFile);
                product.imageDataUrl = dataUrl;
            } catch (error) {
                console.error('Failed to save image:', error);
            }
        }

        await this.indexedDB.add('products', product);

        const updatedProducts = [...this.productsSubject.value, product];
        this.productsSubject.next(updatedProducts);

        return product;
    }

    // Update product
    async updateProduct(dto: UpdateProductDto): Promise<Product> {
        await this.initialize();

        const existing = await this.getProductById(dto.id);
        if (!existing) {
            throw new Error('Product not found');
        }

        const updated: Product = {
            ...existing,
            nameAr: dto.nameAr !== undefined ? dto.nameAr : existing.nameAr,
            nameEn: dto.nameEn !== undefined ? dto.nameEn : existing.nameEn,
            descriptionAr: dto.descriptionAr !== undefined ? dto.descriptionAr : existing.descriptionAr,
            descriptionEn: dto.descriptionEn !== undefined ? dto.descriptionEn : existing.descriptionEn,
            price: dto.price !== undefined ? dto.price : existing.price,
            category: dto.category !== undefined ? dto.category : existing.category,
            available: dto.available !== undefined ? dto.available : existing.available,
            updatedAt: new Date()
        };

        // Handle image update if provided
        if (dto.imageFile) {
            try {
                const dataUrl = await this.indexedDB.saveImage(updated.id, dto.imageFile);
                updated.imageDataUrl = dataUrl;
            } catch (error) {
                console.error('Failed to update image:', error);
            }
        }

        await this.indexedDB.update('products', updated);

        const updatedProducts = this.productsSubject.value.map(p =>
            p.id === updated.id ? updated : p
        );
        this.productsSubject.next(updatedProducts);

        return updated;
    }

    // Delete product
    async deleteProduct(id: string): Promise<void> {
        await this.initialize();

        await this.indexedDB.delete('products', id);

        // Delete associated image
        try {
            await this.indexedDB.delete('images', id);
        } catch (error) {
            console.error('Failed to delete image:', error);
        }

        const updatedProducts = this.productsSubject.value.filter(p => p.id !== id);
        this.productsSubject.next(updatedProducts);
    }

    // Get product image
    async getProductImage(id: string): Promise<string | null> {
        const product = await this.getProductById(id);
        if (product?.imageDataUrl) {
            return product.imageDataUrl;
        }
        return await this.indexedDB.getImage(id);
    }

    // Clear all products (for demo reset)
    async clearAllProducts(): Promise<void> {
        await this.indexedDB.clear('products');
        await this.indexedDB.clear('images');
        this.productsSubject.next([]);
        this.initialized = false;
        await this.initialize();
    }
}
