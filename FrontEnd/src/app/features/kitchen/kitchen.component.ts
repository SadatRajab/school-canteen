import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../core/services/order.service';
import { I18nService, Translation } from '../../core/services/i18n.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
    selector: 'app-kitchen',
    templateUrl: './kitchen.component.html',
    styleUrls: ['./kitchen.component.scss']
})
export class KitchenComponent implements OnInit, OnDestroy {
    t!: Translation;
    orders: Order[] = [];
    loading = true;
    tvMode = true; // Default to TV mode for kitchen
    processingOrders = new Set<string>();
    private ordersSubscription?: Subscription;
    currentLang: string = 'ar';

    constructor(
        private orderService: OrderService,
        private i18n: I18nService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
            this.currentLang = this.i18n.getCurrentLang();
        });

        // Subscribe to orders from OrderService
        this.ordersSubscription = this.orderService.orders$.subscribe(allOrders => {
            // Filter out delivered orders and sort by order number
            this.orders = allOrders
                .filter(order => order.status !== OrderStatus.DELIVERED)
                .sort((a, b) => a.orderNumber - b.orderNumber);
            this.loading = false;
        });
    }

    ngOnDestroy() {
        this.ordersSubscription?.unsubscribe();
    }

    async startPreparing(order: Order) {
        if (this.processingOrders.has(order.id)) return;

        this.processingOrders.add(order.id);

        try {
            await this.orderService.updateOrderStatus(order.id, OrderStatus.PREPARING);
            this.snackBar.open(this.t.preparingStarted || 'Started preparing', this.t.close, { duration: 2000 });
            this.processingOrders.delete(order.id);
        } catch (error) {
            console.error('Failed to start preparing:', error);
            this.processingOrders.delete(order.id);
            this.snackBar.open(this.t.error || 'Error', this.t.close, { duration: 3000 });
        }
    }

    async markDelivered(order: Order) {
        if (this.processingOrders.has(order.id)) return;

        this.processingOrders.add(order.id);

        try {
            await this.orderService.updateOrderStatus(order.id, OrderStatus.DELIVERED);
            this.snackBar.open(this.t.orderDelivered || 'Order delivered', this.t.close, { duration: 2000 });
            this.processingOrders.delete(order.id);
        } catch (error) {
            console.error('Failed to mark as delivered:', error);
            this.processingOrders.delete(order.id);
            this.snackBar.open(this.t.error || 'Error', this.t.close, { duration: 3000 });
        }
    }

    getItemName(item: any): string {
        return this.i18n.getBilingualField(item, 'nameSnapshot');
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
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
