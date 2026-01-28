import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService, Translation } from '../../../core/services/i18n.service';

@Component({
    selector: 'app-order-success',
    templateUrl: './order-success.component.html',
    styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
    t!: Translation;
    order: any;
    orderNumber: string = '';
    orderDate: string = '';
    orderTime: string = '';
    totalAmount: number = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private i18n: I18nService
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        // Get order data from query params
        this.route.queryParams.subscribe(params => {
            if (params['order']) {
                try {
                    this.order = JSON.parse(params['order']);
                    this.initOrderData();
                } catch (e) {
                    console.error('Failed to parse order data:', e);
                    this.router.navigate(['/menu']);
                }
            } else {
                this.router.navigate(['/menu']);
            }
        });
    }

    initOrderData() {
        if (!this.order) return;

        // Use sequential order number
        this.orderNumber = this.order.orderNumber?.toString().padStart(3, '0') || '001';

        const date = new Date(this.order.createdAt || Date.now());
        this.orderDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        this.orderTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Get total amount
        this.totalAmount = this.order.totalAmount || this.order.total || 0;
    }

    backToMenu() {
        this.router.navigate(['/menu']);
    }

    saveScreenshot() {
        window.print();
    }
}
