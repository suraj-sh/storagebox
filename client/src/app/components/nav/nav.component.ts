import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  isMenuOpen = false;
  isCloseIconVisible = false;

  constructor(private router: Router, public authService: AuthenticationService) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.isCloseIconVisible = true;
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isCloseIconVisible = false;
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMenu(); // Close the menu after navigation
  }

  redirectToRegister(): void {
    this.router.navigate(['/register']);
    this.closeMenu(); // Close the menu after navigation
  }

  currentYear: number;

  ngOnInit() {
    this.currentYear = new Date().getFullYear();
  }
}
