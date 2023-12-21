import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  passwordVisible = false;

  get user() {
    return this.registrationForm.get('user');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get pwd() {
    return this.registrationForm.get('pwd');
  }

  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder,
              private router: Router) { }

  registrationForm = this.formBuilder.group({
    user: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
    pwd: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
    confirmPassword: ['', [Validators.required, this.passwordMatchValidator()]],
  });
  

  register() {
    const formData = this.registrationForm.value;
    this.authService.registerUser(formData).subscribe(
      (res) => {
        Swal.fire({
          title: 'Success',
          text: res.success || 'Registration successful',
          icon: 'success',
          iconColor: '#00ff00', // Set the desired color
          confirmButtonText: 'OK'
        });
        this.router.navigate(['/login']);
      },
      (err) => {
        const errorMessage = err?.error?.message || 'An error occurred during registration';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('pwd');
      const confirmPassword = control.get('confirmPassword');
  
      return password && confirmPassword && password.value !== confirmPassword.value
        ? { passwordMismatch: true }
        : null;
    };
  }
  
}
