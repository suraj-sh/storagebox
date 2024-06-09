import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  passwordVisible = false;
  showSpinner = false;
  returnUrl: string;

  constructor(private authService: AuthService, private formBuilder: FormBuilder,
              private router: Router, private route: ActivatedRoute) { 
    // Get the return URL from query parameters or default to the home page
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  loginForm = this.formBuilder.group({
    user: ['', [Validators.required]],
    pwd: ['', [Validators.required]],
  });

  trimInputs() {
    const userValue = this.loginForm.get('user')?.value?.trim() ?? '';
    const pwdValue = this.loginForm.get('pwd')?.value?.trim() ?? '';

    this.loginForm.patchValue({
      user: userValue,
      pwd: pwdValue
    });
  }

  login() {
    this.trimInputs();

    const formData = {
      user: this.loginForm.value.user,
      email: this.loginForm.value.user,
      pwd: this.loginForm.value.pwd,
    };

    // Show spinner
    this.showSpinner = true;

    this.authService.loginUser(formData).subscribe(
      (res) => {
        Swal.fire({
          title: 'Login Successful',
          text: 'Welcome back!',
          icon: 'success',
          confirmButtonText: 'Continue',
          iconColor: '#00ff00',
        }).then(() => {
          this.showSpinner = false;
          this.router.navigateByUrl(this.returnUrl); // Redirect to the return URL
          this.loginForm.reset();
        });
      },
      (err) => {
        // Handle login error
        this.showSpinner = false;
        Swal.fire({
          title: 'Login Failed',
          text: 'Please check your username and password.',
          icon: 'error',
          confirmButtonText: 'Try Again',
          iconColor: '#ff0000',
        });
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}