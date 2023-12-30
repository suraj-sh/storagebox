import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  passwordVisible = false;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      user: ['', [Validators.required]],
      pwd: ['', [Validators.required]],
    });
  }

  login() {

    this.authService.loginUser(this.loginForm.value).subscribe(
      (res) => {
        Swal.fire({
          title: 'Login Successful',
          text: 'Welcome back!',
          icon: 'success',
          confirmButtonText: 'Continue',
          iconColor: '#00ff00',
        });
        localStorage.setItem('token', res.acessToken);
        this.router.navigate(['/home']);
        this.loginForm.reset();
      },
      (err) => {
        let errorMessage = 'Invalid username or password. Please try again.';

        if (err.status === 401) {
          errorMessage = 'Incorrect username or password. Please try again.';
        }

        Swal.fire({
          title: 'Login Failed',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Retry',
        });
        console.log(err);
      }
    );
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
