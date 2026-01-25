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

        // Generate order number - use orderNumber if exists, otherwise create from _id
        if (this.order.orderNumber) {
            this.orderNumber = this.order.orderNumber;
        } else if (this.order._id) {
            // Format: A-XXX where XXX is last 3 chars of ID in uppercase
            const lastThree = this.order._id.slice(-3).toUpperCase();
            this.orderNumber = 'A-' + lastThree;
        } else {
            // Fallback to random number
            this.orderNumber = 'A-' + Math.floor(Math.random() * 999).toString().padStart(3, '0');
        }

        const date = new Date(this.order.createdAt || Date.now());
        this.orderDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        this.orderTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Get total amount
        this.totalAmount = this.order.totalAmount || 0;
    }

    backToMenu() {
        this.router.navigate(['/menu']);
    }

    saveScreenshot() {
        window.print();
    }
}
