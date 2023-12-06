import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;  // Declare confirmPassword property

  registrationForm: FormGroup;
  passwordVisible = false;

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  register() {
    console.log('Register method called');
    if (this.registrationForm.valid) {
      const user = this.registrationForm.value;
      console.log('User:', user);
      this.authService.register(user).subscribe(
        (response) => {
          console.log('Registration successful', response);
        },
        (error) => {
          console.error('Registration failed', error);
        }
      );
    } else {
      console.error('Invalid form submission. Please check the form.');
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
