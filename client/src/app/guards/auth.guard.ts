import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) { }

  // canActivate() {
  //   if (this.authService.loggedIn()) {
  //     this.router.navigate(['']);
  //   }
  //   return !this.authService.loggedIn();
  // }
}
