import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  passwordVisible = false;
  token: string;

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((val) => {
      this.token = val['token'];
      console.log(this.token);
    });

    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(12), 
                  Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
      confirmPassword: ['', [Validators.required, this.passwordMatchValidator()]],
    });
  }

  resetPassword() {
      let resetObj = {
        token: this.token,
        password: this.resetPasswordForm.value.password,
      };

      this.authService.resetPassword(resetObj).subscribe(
        (res: any) => {
          Swal.fire({
            title: 'Password Reset Successful',
            text: 'Your password has been reset successfully.',
            icon: 'success',
            confirmButtonText: 'Login',
          });
          this.router.navigate(['/login']);
        }
      ); 
  }
  

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      return password && confirmPassword && password.value !== confirmPassword.value
        ? { passwordMismatch: true }
        : null;
    };
  }
}
