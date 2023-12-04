import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent{
  
  name: String;
  email: String;
  password: String;

  onRegisterSubmit(){
    const user  = {
      name: this.name,
      email: this.email,
      password: this.password
    }

  }

  constructor(private authService: AuthenticationService) {}

  register(user: any) {
    this.authService.register(user).subscribe(
      (response) => {
        console.log('Registration successful', response);
      },
      (error) => {
        console.error('Registration failed', error);
      }
    );
  }
  passwordVisible = false;

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
