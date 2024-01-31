import { Component } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  sellers: any[] = [];

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    this.loadSellers();
  }

  loadSellers() {
    this.authService.getSellers().subscribe((data: any[]) => {
      this.sellers = data;
    });
  }

  verifySeller(userId: string) {
    // Implement the logic to send a verification request to your backend
    // For example, you can call a service method to update the 'isActive' status
    // of the seller with the given 'userId'.
  }

}
