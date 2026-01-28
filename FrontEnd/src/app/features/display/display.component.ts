import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { I18nService, Translation } from '../../core/services/i18n.service';
import { Order, OrderStatus } from '../../core/models/order.model';

@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.scss']
})
export class DisplayComponent implements OnInit, OnDestroy {
    t!: Translation;
    orders: Order[] = [];
    loading = true;
    tvMode = false;
    private ordersSubscription?: Subscription;

    constructor(
        private orderService: OrderService,
        private i18n: I18nService
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        this.ordersSubscription = this.orderService.orders$.subscribe(allOrders => {
            this.orders = allOrders
                .filter(order => this.shouldDisplayOrder(order))
                .sort((a, b) => a.orderNumber - b.orderNumber);
            this.loading = false;
        });
    }

    ngOnDestroy() {
        this.ordersSubscription?.unsubscribe();
    }

    toggleTVMode() {
        this.tvMode = !this.tvMode;
    }

    getStatusClass(status: string): string {
        return `status-${status.toLowerCase()}`;
    }

    shouldDisplayOrder(order: Order): boolean {
        // إذا لم يكن الطلب مسلماً، اعرضه
        if (order.status !== OrderStatus.DELIVERED) {
            return true;
        }

        // إذا كان مسلماً، تحقق من الوقت
        const now = new Date();
        const updatedAt = new Date(order.updatedAt || order.createdAt);
        const diffMs = now.getTime() - updatedAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        // اعرض الطلب المسلم إذا مر عليه أقل من دقيقة
        return diffMins < 1;
    }

    getTimeAgo(date: Date | string): { en: string; ar: string } {
        const now = new Date();
        const orderDate = new Date(date);
        const diffMs = now.getTime() - orderDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) {
            return { en: 'Just now', ar: 'الآن' };
        } else if (diffMins < 60) {
            return { en: `${diffMins}m ago`, ar: `دقائق ${diffMins}` };
        } else {
            return { en: `${diffHours}h ago`, ar: `ساعات ${diffHours}` };
        }
    }
}
