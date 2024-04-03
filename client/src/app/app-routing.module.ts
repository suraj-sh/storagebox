import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdpostComponent } from './components/ads/adpost/adpost.component';
import { AdviewComponent } from './components/ads/adview/adview.component';
import { AdDetailComponent } from './components/ads/ad-detail/ad-detail.component';
import { AdDashboardComponent } from './components/ads/ad-dashboard/ad-dashboard.component';
import { AuthGuard } from './guards/auth.guard'
import { OwnerGuard } from './guards/owner.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminGuard } from './guards/admin.guard';
import { AboutUsComponent } from './components/about-us/about-us.component';

const routes: Routes = [

  { path: '', component: HomeComponent },
  { path: 'about', component: AboutUsComponent },

  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

  // Profile route
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // Ad routes
  { path: 'post', component: AdpostComponent, canActivate: [AuthGuard, OwnerGuard] },
  { path: 'view', component: AdviewComponent },
  { path: 'details/:id', component: AdDetailComponent, canActivate: [AuthGuard] },
  { path: 'ads', component: AdDashboardComponent, canActivate: [AuthGuard, OwnerGuard] },
  { path: 'edit-ad/:id', component: AdpostComponent, canActivate: [AuthGuard, OwnerGuard] },

  // Admin route
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },

  // 404 Page route
  { path: '**', component: NotFoundComponent }, // Redirect to NotFoundComponent for any other route

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }