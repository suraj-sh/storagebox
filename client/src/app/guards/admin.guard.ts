import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isLoggedIn$.pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          const decodedToken = this.authService.decodeToken();
          const userRole = decodedToken ? decodedToken.role : null;
          if (userRole === 'Admin') {
            return true; // Allow access if user is logged in and has the role of "Admin"
          } else {
            // Redirect to 404 page if user role is not "Admin"
            return this.router.createUrlTree(['/404']);
          }
        } else {
          // Redirect to login page if user is not logged in
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
