import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdpostComponent } from './components/adpost/adpost.component';
import { AuthGuard } from '@auth0/auth0-angular';
import { AdviewComponent } from './components/adview/adview.component';
import { AdDetailComponent } from './components/ad-detail/ad-detail.component';
import { AdDashboardComponent } from './components/ad-dashboard/ad-dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: '', redirectTo: '', pathMatch: 'full' },

  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

  // Profile route
  { path: 'profile', component: ProfileComponent },

  // Ads routes
  { path: 'post', component: AdpostComponent },
  { path: 'view', component: AdviewComponent },
  { path: 'details/:id', component: AdDetailComponent},
  { path: 'ads', component: AdDashboardComponent },

  // New route for editing an ad
  { path: 'edit-ad/:id', component: AdpostComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }