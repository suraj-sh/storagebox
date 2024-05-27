import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.authService.isLoggedIn$.pipe(
      take(1), // Take only one value and then complete
      map((isLoggedIn: boolean) => {
        if (isLoggedIn) {
          return true; // User is authenticated, allow access
        } else {
          this.router.navigate(['/login']); // User is not authenticated, redirect to login
          return false;
        }
      })
    );
  }
}
