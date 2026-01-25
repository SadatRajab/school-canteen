import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../core/services/api.service';
import { I18nService, Translation } from '../../core/services/i18n.service';
import { KitchenOrder } from '../../core/models/models';

@Component({
    selector: 'app-kitchen',
    templateUrl: './kitchen.component.html',
    styleUrls: ['./kitchen.component.scss']
})
export class KitchenComponent implements OnInit, OnDestroy {
    t!: Translation;
    orders: KitchenOrder[] = [];
    loading = true;
    tvMode = true; // Default to TV mode for kitchen
    processingOrders = new Set<string>();
    private refreshSubscription?: Subscription;
    currentLang: string = 'ar';

    constructor(
        private apiService: ApiService,
        private i18n: I18nService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
            this.currentLang = this.i18n.getCurrentLang();
        });

        this.loadOrders();
        this.startAutoRefresh();
    }

    ngOnDestroy() {
        this.refreshSubscription?.unsubscribe();
    }

    loadOrders() {
        this.apiService.getKitchenTodayOrders().subscribe({
            next: (response) => {
                console.log('Kitchen orders response:', response);
                console.log('Kitchen orders data:', response.data);
                this.orders = response.data
                    .filter(order => order.status !== 'DELIVERED')
                    .sort((a, b) => a.orderNumber - b.orderNumber);
                console.log('Filtered orders:', this.orders);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    startAutoRefresh() {
        this.refreshSubscription = interval(3000) // 3 seconds for kitchen
            .pipe(switchMap(() => this.apiService.getKitchenTodayOrders()))
            .subscribe({
                next: (response) => {
                    this.orders = response.data
                        .filter(order => order.status !== 'DELIVERED')
                        .sort((a, b) => a.orderNumber - b.orderNumber);
                }
            });
    }

    startPreparing(order: KitchenOrder) {
        const orderId = order.orderId || order._id;
        if (!orderId || this.processingOrders.has(orderId)) return;

        this.processingOrders.add(orderId);

        this.apiService.startPreparingOrder(orderId).subscribe({
            next: () => {
                this.processingOrders.delete(orderId);
                this.snackBar.open(this.t.preparingStarted, this.t.close, { duration: 2000 });
                this.loadOrders();
            },
            error: () => {
                this.processingOrders.delete(orderId);
                this.snackBar.open(this.t.error, this.t.close, { duration: 3000 });
            }
        });
    }

    markDelivered(order: KitchenOrder) {
        const orderId = order.orderId || order._id;
        console.log('markDelivered called:', { order, orderId, hasOrderId: !!orderId });

        if (!orderId) {
            console.log('Blocked: No orderId');
            return;
        }

        if (this.processingOrders.has(orderId)) {
            console.log('Blocked: Already processing');
            return;
        }

        this.processingOrders.add(orderId);
        console.log('Calling API to mark delivered:', orderId);

        this.apiService.markOrderDelivered(orderId).subscribe({
            next: () => {
                console.log('Successfully marked as delivered');
                this.processingOrders.delete(orderId);
                this.snackBar.open(this.t.orderDelivered, this.t.close, { duration: 2000 });
                this.loadOrders();
            },
            error: (err) => {
                console.error('Error marking as delivered:', err);
                this.processingOrders.delete(orderId);
                this.snackBar.open(this.t.error, this.t.close, { duration: 3000 });
            }
        });
    }

    markNotDelivered(order: KitchenOrder) {
        const orderId = order.orderId || order._id;
        console.log('markNotDelivered called:', { order, orderId, hasOrderId: !!orderId });

        if (!orderId) {
            console.log('Blocked: No orderId');
            return;
        }

        if (this.processingOrders.has(orderId)) {
            console.log('Blocked: Already processing');
            return;
        }

        this.processingOrders.add(orderId);
        console.log('Calling API to cancel order:', orderId);

        // يمكنك تغيير الحالة لـ CANCELLED أو حذف الطلب
        this.apiService.cancelOrder(orderId).subscribe({
            next: () => {
                console.log('Successfully cancelled order');
                this.processingOrders.delete(orderId);
                this.snackBar.open('تم إلغاء الطلب', this.t.close, { duration: 2000 });
                this.loadOrders();
            },
            error: (err) => {
                console.error('Error cancelling order:', err);
                this.processingOrders.delete(orderId);
                this.snackBar.open(this.t.error, this.t.close, { duration: 3000 });
            }
        });
    }

    getItemName(item: any): string {
        return this.i18n.getBilingualField(item, 'nameSnapshot');
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    getOrderId(order: KitchenOrder): string {
        return order.orderId || order._id || '';
    }

    isProcessing(orderId: string): boolean {
        return this.processingOrders.has(orderId);
    }

    toggleTVMode() {
        this.tvMode = !this.tvMode;
    }

    toggleLanguage() {
        this.i18n.toggleLanguage();
    }
}
