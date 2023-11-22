// src/app/home/home.component.ts
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // encapsulation: ViewEncapsulation.None, // Add this line
})
export class HomeComponent {
  redirectToPost() {
    window.location.href = '../post-ad-page/post.html';
  }

  redirectToView() {
    window.location.href = '../adview-page/adview.html';
  }

  redirectlogin() {
    window.location.href = '../signup-and-login-page/index.html';
  }

  toggleMenu() {
    const navUl = document.querySelector('nav ul');
    if (navUl) {
      navUl.classList.toggle('show');
    }
  }
}
