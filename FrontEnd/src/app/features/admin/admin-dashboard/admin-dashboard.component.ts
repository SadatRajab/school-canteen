import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { OrderService } from '../../../core/services/order.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
    t!: Translation;
    selectedTab = 0;
    currentLang = 'ar';

    // KPI Data
    todayProfit = 0;
    totalOrders = 0;
    pendingOrders = 0;
    private ordersSubscription?: Subscription;

    constructor(
        private authService: AuthService,
        private i18n: I18nService,
        private router: Router,
        private orderService: OrderService
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe((lang) => {
            this.currentLang = lang;
            this.t = this.i18n.getTranslations();
        });

        this.loadKPIData();
    }

    ngOnDestroy() {
        this.ordersSubscription?.unsubscribe();
    }

    loadKPIData() {
        this.ordersSubscription = this.orderService.orders$.subscribe(() => {
            this.todayProfit = this.orderService.getTodayRevenue();
            this.totalOrders = this.orderService.getTodayOrders().length;
            this.pendingOrders = this.orderService.getPendingOrdersCount();
        });
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
        this.i18n.setLanguage(newLang);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/admin/login']);
    }
}
