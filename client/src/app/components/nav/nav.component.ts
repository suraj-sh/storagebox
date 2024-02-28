import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/auth.service';
import { Observable } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  isMenuOpen: boolean = false;
  isCloseIconVisible: boolean = false;
  userProfile: any;
  currentYear: number;
  isLoggedIn$: Observable<boolean>;

  constructor(private router: Router, private authService: AuthenticationService,
    private profileService: ProfileService) {

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.authService.isLoggedInSubject.next(isLoggedIn);
  }


  ngOnInit() {
    this.currentYear = new Date().getFullYear();
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    // Subscribe to isLoggedIn$ to update user profile after login
    this.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadUserProfile();
      } else {
        // Clear user profile if not logged in
        this.userProfile = null;
      }
    });
    
    // Subscribe to userInfoUpdated event from ProfileService
    this.profileService.userInfoUpdated.subscribe(updatedUserInfo => {
      // Check if user is logged in before updating profile
      if (this.authService.isLoggedInSubject.value) {
        this.loadUserProfile();
      }
    });
  }

  loadUserProfile(): void {
    const decodedToken = this.authService.decodeToken();
    if (decodedToken) {
      const userId = decodedToken.userId;
      this.profileService.getUser(userId).subscribe(
        (userData: any) => {
          this.userProfile = userData;
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          alert('Failed to fetch user details. Please try again later.');
        }
      );
    } 
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
}