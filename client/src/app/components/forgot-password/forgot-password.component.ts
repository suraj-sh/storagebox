import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService} from 'ngx-spinner';

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

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder, 
              private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submitEmail() {
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
        // Show spinner
        this.showSpinner = false;
      },
      // (err) => {
      //   this.spinner.hide();
      //   Swal.fire({
      //     title: 'Error',
      //     text: 'Failed to send password reset link. Please try again.',
      //     icon: 'error',
      //     confirmButtonText: 'Retry',
      //   });
      //   console.log(err);
      // }
    );
  }
}