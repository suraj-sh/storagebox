import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  isMenuOpen = false;
  isCloseIconVisible = false;

  currentYear: number;
  isLoggedIn$: Observable<boolean>;

  constructor(private router: Router, public authService: AuthenticationService,
    private cookieService: CookieService, private http: HttpClient) {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.authService.isLoggedInSubject.next(isLoggedIn);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.isCloseIconVisible = this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isCloseIconVisible = false;
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  redirectToRegister(): void {
    this.router.navigate(['/register']);
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }
  
}
