import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  constructor(private authService: AuthenticationService) {}

  login(credentials: any) {
    this.authService.login(credentials).subscribe(
      (response) => {
        console.log('Login successful', response);
      },
      (error) => {
        console.error('Login failed', error);
      }
    );
  }
  passwordVisible = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
