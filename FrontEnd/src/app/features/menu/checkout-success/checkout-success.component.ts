import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService, Translation } from '../../../core/services/i18n.service';
import { Order } from '../../../core/models/models';

@Component({
  selector: 'app-checkout-success',
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent implements OnInit {
  t!: Translation;
  order?: Order;

  constructor(
    private router: Router,
    private i18n: I18nService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.order = navigation?.extras?.state?.['order'];

    if (!this.order) {
      this.router.navigate(['/menu']);
    }
  }

  ngOnInit() {
    this.i18n.lang$.subscribe(() => {
      this.t = this.i18n.getTranslations();
    });
  }

  getItemName(item: any): string {
    return this.i18n.getBilingualField(item, 'nameSnapshot');
  }

  backToMenu() {
    this.router.navigate(['/menu']);
  }
}
