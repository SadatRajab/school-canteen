import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../../core/services/order.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-orders-list',
    templateUrl: './orders-list.component.html',
    styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit, OnDestroy {
    @Input() compact = false;

    t!: Translation;
    orders: Order[] = [];
    displayedColumns = ['orderNumber', 'items', 'total', 'status', 'createdAt', 'actions'];
    loading = true;
    statusFilter = 'all';
    processingOrders = new Set<string>();
    private ordersSubscription?: Subscription;

    constructor(
        private orderService: OrderService,
        private i18n: I18nService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        this.ordersSubscription = this.orderService.orders$.subscribe(allOrders => {
            this.orders = allOrders.sort((a, b) => b.orderNumber - a.orderNumber);
            this.loading = false;
        });
    }

    ngOnDestroy() {
        this.ordersSubscription?.unsubscribe();
    }

    get filteredOrders(): Order[] {
        if (this.statusFilter === 'all') {
            return this.orders;
        }
        return this.orders.filter(order => order.status === this.statusFilter);
    }

    getItemName(item: any): string {
        return this.i18n.getBilingualField(item, 'nameSnapshot');
    }

    async deliverOrder(order: Order) {
        if (this.processingOrders.has(order.id)) return;

        this.processingOrders.add(order.id);

        try {
            await this.orderService.updateOrderStatus(order.id, OrderStatus.DELIVERED);
            this.processingOrders.delete(order.id);
            this.snackBar.open(this.t.orderDelivered || 'Order delivered', this.t.close, { duration: 2000 });
        } catch (error) {
            this.processingOrders.delete(order.id);
            this.snackBar.open(this.t.error || 'Error', this.t.close, { duration: 3000 });
        }
    }

    isProcessing(orderId: string): boolean {
        return this.processingOrders.has(orderId);
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }
}
