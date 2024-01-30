import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

const adminRoutes: Routes = [
  { path: 'admin/dashboard', component: AdminDashboardComponent },

];

@NgModule({
  declarations: [
    AdminDashboardComponent,

  ],
  imports: [
    CommonModule,
    RouterModule.forChild(adminRoutes),
  ],
})
export class AdminModule { }
