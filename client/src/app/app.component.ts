import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'client';

  constructor(private router: Router, authService: AuthService) {}

  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}

