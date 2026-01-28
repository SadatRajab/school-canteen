export interface Product {
    id: string;
    nameAr: string;
    nameEn: string;
    descriptionAr?: string;
    descriptionEn?: string;
    price: number;
    category: ProductCategory;
    imageDataUrl?: string; // Base64 data URL for image
    available: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export enum ProductCategory {
    SANDWICHES = 'sandwiches',
    DRINKS = 'drinks',
    SNACKS = 'snacks',
    DESSERTS = 'desserts',
    HOT_MEALS = 'hot_meals'
}

export interface CreateProductDto {
    nameAr: string;
    nameEn: string;
    descriptionAr?: string;
    descriptionEn?: string;
    price: number;
    category: ProductCategory;
    imageFile?: File;
    available?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
    id: string;
}
