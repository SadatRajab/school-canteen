import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';

@Component({
    selector: 'app-profit-display',
    templateUrl: './profit-display.component.html',
    styleUrls: ['./profit-display.component.scss']
})
export class ProfitDisplayComponent implements OnInit {
    t!: Translation;
    todayProfit = 0;
    totalProfit = 0;
    loading = true;

    constructor(
        private apiService: ApiService,
        private i18n: I18nService
    ) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });

        this.loadProfit();
    }

    loadProfit() {
        this.apiService.getTodayProfit().subscribe({
            next: (response) => {
                this.todayProfit = response.data.profit;
            }
        });

        this.apiService.getTotalProfit().subscribe({
            next: (response) => {
                this.totalProfit = response.data.profit;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }
}
