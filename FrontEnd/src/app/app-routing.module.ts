import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/menu',
        pathMatch: 'full'
    },
    {
        path: 'menu',
        loadChildren: () => import('./features/menu/menu.module').then(m => m.MenuModule)
    },
    {
        path: 'display',
        loadChildren: () => import('./features/display/display.module').then(m => m.DisplayModule)
    },
    {
        path: 'kitchen',
        loadChildren: () => import('./features/kitchen/kitchen.module').then(m => m.KitchenModule)
    },
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
    },
    {
        path: '**',
        redirectTo: '/menu'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
