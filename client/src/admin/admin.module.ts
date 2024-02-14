import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminService } from './admin.service';
import { UserManagementComponent } from './user-management/user-management.component';


@NgModule({
  declarations: [
    AdminDashboardComponent,
    UserManagementComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxSpinnerModule,
    AdminRoutingModule, 
  ],
  providers: [
    // Add any admin-specific services here
    AdminService
  ]
})

export class AdminModule { }
