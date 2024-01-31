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

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder,
    private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((val) => {
      this.token = val['token'];
      console.log(this.token);
    });

    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(12),
      Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  isButtonDisabled(): boolean {
    return this.resetPasswordForm.invalid || this.resetPasswordForm.get('password')?.value !== this.resetPasswordForm.get('confirmPassword')?.value;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
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

}
