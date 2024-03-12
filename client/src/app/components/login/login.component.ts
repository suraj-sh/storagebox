import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  passwordVisible = false;
  showSpinner = false;

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder,
              private router: Router) { }


  loginForm = this.formBuilder.group({
    user: ['', [Validators.required]],
    pwd: ['', [Validators.required]],
  });

  login() {
    const formData = {
      user: this.loginForm.value.user,
      email: this.loginForm.value.user,
      pwd: this.loginForm.value.pwd,
    };

    console.log(formData);

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
          this.router.navigate(['']);
          this.loginForm.reset();
        });
      },
    );
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}