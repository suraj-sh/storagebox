import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OwnerGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.authService.isLoggedIn$.pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          const decodedToken = this.authService.decodeToken();
          const userRole = decodedToken ? decodedToken.role : null;
          if (userRole === 'Owner') {
            return true; // Allow access if user is logged in and has the role of "Owner"
          } else {
            // Redirect to 404 error page
            return this.router.createUrlTree(['/404']);
          }
        } else {
          // Redirect to login page
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
