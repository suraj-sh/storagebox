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
    const formData = {
      user: this.loginForm.value.user,
      email: this.loginForm.value.user,
      pwd: this.loginForm.value.pwd,
    };
    console.log(formData);
    this.authService.loginUser(formData).subscribe(
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
    );
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
