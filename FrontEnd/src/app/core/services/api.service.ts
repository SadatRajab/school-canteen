import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '@env/environment';
import {
    Product,
    Order,
    CreateOrderRequest,
    CreateOrderResponse,
    KitchenOrder,
    ApiResponse,
    AdminLoginRequest,
    AdminLoginResponse,
    ProfitResponse,
    ProductForm,
    UploadResponse
} from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;
    private productsCache$?: Observable<ApiResponse<Product[]>>;

    constructor(private http: HttpClient) { }

    // ==================== PUBLIC ENDPOINTS ====================

    // Health Check
    healthCheck(): Observable<any> {
        return this.http.get(`${this.baseUrl}/health`);
    }

    // Products
    getProducts(category?: string, available?: boolean): Observable<ApiResponse<Product[]>> {
        if (!category && !available && this.productsCache$) {
            return this.productsCache$;
        }

        let params = new HttpParams();
        if (category) params = params.set('category', category);
        if (available !== undefined) params = params.set('available', available.toString());

        const request$ = this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/products`, { params });

        if (!category && !available) {
            this.productsCache$ = request$.pipe(shareReplay(1));
            return this.productsCache$;
        }

        return request$;
    }

    getProduct(id: string): Observable<ApiResponse<Product>> {
        return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`);
    }

    // Orders
    createOrder(order: CreateOrderRequest): Observable<CreateOrderResponse> {
        return this.http.post<CreateOrderResponse>(`${this.baseUrl}/orders`, order);
    }

    getTodayOrders(): Observable<ApiResponse<Order[]>> {
        return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/orders/today`);
    }

    getOrder(id: string): Observable<ApiResponse<Order>> {
        return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/orders/${id}`);
    }

    // ==================== KITCHEN ENDPOINTS ====================

    getKitchenTodayOrders(): Observable<ApiResponse<KitchenOrder[]>> {
        return this.http.get<ApiResponse<KitchenOrder[]>>(`${this.baseUrl}/kitchen/orders/today`);
    }

    getKitchenOrders(date?: string, status?: string): Observable<ApiResponse<KitchenOrder[]>> {
        let params = new HttpParams();
        if (date) params = params.set('date', date);
        if (status) params = params.set('status', status);

        return this.http.get<ApiResponse<KitchenOrder[]>>(`${this.baseUrl}/kitchen/orders`, { params });
    }

    startPreparingOrder(orderId: string): Observable<ApiResponse<KitchenOrder>> {
        return this.http.patch<ApiResponse<KitchenOrder>>(
            `${this.baseUrl}/kitchen/orders/${orderId}/start`,
            {}
        );
    }

    // ==================== ADMIN ENDPOINTS ====================

    // Admin Auth
    adminLogin(credentials: AdminLoginRequest): Observable<AdminLoginResponse> {
        return this.http.post<AdminLoginResponse>(`${this.baseUrl}/admin/login`, credentials);
    }

    // Admin Products
    createProduct(product: ProductForm): Observable<ApiResponse<Product>> {
        return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/admin/products`, product);
    }

    updateProduct(id: string, product: ProductForm): Observable<ApiResponse<Product>> {
        return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/admin/products/${id}`, product);
    }

    deleteProduct(id: string): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/admin/products/${id}`);
    }

    // Admin Orders
    getAdminOrders(date?: string, status?: string): Observable<ApiResponse<Order[]>> {
        let params = new HttpParams();
        if (date) params = params.set('date', date);
        if (status) params = params.set('status', status);

        return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/admin/orders`, { params });
    }

    deliverOrder(orderId: string): Observable<ApiResponse<Order>> {
        return this.http.patch<ApiResponse<Order>>(
            `${this.baseUrl}/admin/orders/${orderId}/deliver`,
            {}
        );
    }

    markOrderDelivered(orderId: string): Observable<ApiResponse<Order>> {
        return this.http.patch<ApiResponse<Order>>(
            `${this.baseUrl}/kitchen/orders/${orderId}/deliver`,
            {}
        );
    }

    cancelOrder(orderId: string): Observable<ApiResponse<Order>> {
        return this.http.patch<ApiResponse<Order>>(
            `${this.baseUrl}/kitchen/orders/${orderId}/cancel`,
            {}
        );
    }

    // Admin Profit
    getTodayProfit(): Observable<ProfitResponse> {
        return this.http.get<ProfitResponse>(`${this.baseUrl}/admin/profit/today`);
    }

    getTotalProfit(): Observable<ProfitResponse> {
        return this.http.get<ProfitResponse>(`${this.baseUrl}/admin/profit/total`);
    }

    // Admin Upload
    uploadImage(file: File): Observable<UploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<UploadResponse>(`${this.baseUrl}/admin/upload`, formData);
    }

    // Clear products cache (call after creating/updating/deleting product)
    clearProductsCache(): void {
        this.productsCache$ = undefined;
    }
}
