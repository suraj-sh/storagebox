import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/admin/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {

  sellers: any[] = [];
  userCount: number;
  sellerCount: number;
  verifiedCount: number;
  notVerifiedCount: number;
  showSpinner = false;

  constructor(private adminService: AdminService, private router: Router) { }

  isDashboardVisible: boolean = true;
  isUserManagementVisible: boolean = false;
  selectedIndex: number = 0;
  isMenuOpen: boolean = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnInit() {
    this.loadSellers();
    this.loadCount();
    this.loadSellerCount();
    this.loadVerifiedCount();
  }

  onMenuItemClick(menuItem: string) {
    switch (menuItem) {
      case 'dashboard':
        this.isDashboardVisible = true;
        this.isUserManagementVisible = false;
        this.selectedIndex = 0; // Update selected menu item index
        break;
      case 'user-management':
        this.isDashboardVisible = false;
        this.isUserManagementVisible = true;
        this.selectedIndex = 1; // Update selected menu item index
        break;
    }
  }


  onItemClicked(menuItemIndex: number) {
    this.selectedIndex = menuItemIndex;
    if (menuItemIndex === 0) {
      this.isDashboardVisible = true;
      this.isUserManagementVisible = false;
      this.router.navigateByUrl('/admin/dashboard'); // Navigate to dashboard URL
    } else if (menuItemIndex === 1) {
      this.isDashboardVisible = false;
      this.isUserManagementVisible = true;
      this.router.navigateByUrl('/admin/user-management'); // Navigate to user management URL
    }
    this.isMenuOpen = false; // Close the sidebar
  }


  loadSellers() {
    this.adminService.getSellers().subscribe((data: any[]) => {
      this.sellers = data;
    });
  }

  loadCount() {
    this.adminService.getCount().subscribe((response: any) => {
      this.userCount = response.count;
    });
  }

  loadSellerCount() {
    this.adminService.getSellerCount().subscribe((response: any) => {
      this.sellerCount = response.count;
    });
  }

  loadVerifiedCount() {
    this.adminService.getVerifiedCount().subscribe((response: any) => {
      // Filter the sellers array to include only active sellers who are verified
      const verifiedSellers = this.sellers.filter(seller => seller.isSeller && seller.isActiveSeller);
      // Count the number of verified sellers
      this.verifiedCount = verifiedSellers.length;
      // Calculate the number of not verified sellers
      this.notVerifiedCount = this.sellerCount - this.verifiedCount;
    });
  }

  verifySeller(userId: string) {

    this.showSpinner = true;
    this.adminService.changeUserToSeller(userId).subscribe(
      (res) => {
        Swal.fire({
          title: 'User Verified Successfully',
          icon: 'success',
          iconColor: '#00ff00',
        }).then(() => {
          this.loadSellers();
          this.loadCount();
          this.loadSellerCount();
          this.loadVerifiedCount();
          this.showSpinner = false;
        });
      },
    );
  }

  logout() {
    this.adminService.logout();
  }

}
