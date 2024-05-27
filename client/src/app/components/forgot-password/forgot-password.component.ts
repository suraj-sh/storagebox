import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  showSpinner = false;

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  trimInputs() {
    const trimmedValues = {
      email: this.forgotPasswordForm.get('email')?.value?.trim() ?? '',
    };

    this.forgotPasswordForm.patchValue(trimmedValues);
  }

  submitEmail() {
    this.trimInputs();

    // Show spinner
    this.showSpinner = true;
    this.authService.forgotpass(this.forgotPasswordForm.value).subscribe(
      (res) => {
        Swal.fire({
          title: 'Email Sent',
          text: 'Password reset link sent to your email.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
        this.forgotPasswordForm.reset();
        // Hide spinner
        this.showSpinner = false;
      }
    );
  }
}
