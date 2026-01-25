import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { Order } from '../../../core/models/models';

@Component({
    selector: 'app-orders-list',
    templateUrl: './orders-list.component.html',
    styleUrls: ['./orders-list.component.scss']
})
export class OrdersListComponent implements OnInit {
    @Input() compact = false;

    t!: Translation;
    orders: Order[] = [];
    displayedColumns = ['orderNumber', 'items', 'total', 'status', 'createdAt', 'actions'];
    loading = true;
    statusFilter = 'all';
    processingOrders = new Set<string>();

    constructor(
        private apiService: ApiService,
        private i18n: I18nService,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        this.loadOrders();
    }

    loadOrders() {
        this.apiService.getAdminOrders().subscribe({
            next: (response) => {
                this.orders = response.data.sort((a, b) => b.orderNumber - a.orderNumber);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
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

    deliverOrder(order: Order) {
        if (this.processingOrders.has(order._id)) return;

        this.processingOrders.add(order._id);

        this.apiService.deliverOrder(order._id).subscribe({
            next: () => {
                this.processingOrders.delete(order._id);
                this.snackBar.open(this.t.orderDelivered, this.t.close, { duration: 2000 });
                this.loadOrders();
            },
            error: () => {
                this.processingOrders.delete(order._id);
                this.snackBar.open(this.t.error, this.t.close, { duration: 3000 });
            }
        });
    }

    isProcessing(orderId: string): boolean {
        return this.processingOrders.has(orderId);
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }
}
