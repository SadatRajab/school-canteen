import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { ApiService } from '../../../core/services/api.service';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
    t!: Translation;
    selectedTab = 0;
    currentLang = 'ar';

    // KPI Data
    todayProfit = 0;
    totalOrders = 0;
    pendingOrders = 0;

    constructor(
        private authService: AuthService,
        private i18n: I18nService,
        private router: Router,
        private api: ApiService
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe((lang) => {
            this.currentLang = lang;
            this.t = this.i18n.getTranslations();
        });

        this.loadKPIData();
    }

    loadKPIData() {
        // Load today's profit
        this.api.getTodayProfit().subscribe({
            next: (response) => {
                this.todayProfit = response.data?.totalProfit || response.data?.profit || 0;
            },
            error: (err: any) => console.error('Error loading profit:', err)
        });

        // Load total orders today
        this.api.getTodayOrders().subscribe({
            next: (response) => {
                this.totalOrders = response.data?.length || 0;
                this.pendingOrders = response.data?.filter((o) =>
                    o.status === 'PENDING' || o.status === 'PREPARING'
                ).length || 0;
            },
            error: (err: any) => console.error('Error loading orders:', err)
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
