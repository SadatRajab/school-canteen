import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DisplayComponent } from './display.component';

const routes: Routes = [
    { path: '', component: DisplayComponent }
];

@NgModule({
    declarations: [DisplayComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatCardModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule
    ]
})
export class DisplayModule { }
