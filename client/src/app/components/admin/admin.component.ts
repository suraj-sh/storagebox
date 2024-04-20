import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {

  sellers: any[] = [];
  users: any[] = [];
  userCount: number;
  sellerCount: number;
  verifiedCount: number;
  notVerifiedCount: number = 0;
  notVerifiedCountLoaded: boolean = false;
  sortByRoleOrder: boolean = false;
  showSpinner = false;

  constructor(private adminService: AdminService, private route: ActivatedRoute) { }

  isDashboardVisible: boolean = true;
  isUserManagementVisible: boolean = false;
  selectedIndex: number = 0;
  isMenuOpen: boolean = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleRoleOrder(): void {
    this.sortByRoleOrder = !this.sortByRoleOrder;
    // Sort the users array based on the role
    if (this.sortByRoleOrder) {
      this.users.sort((a, b) => a.isSeller ? -1 : 1); // Sort by role (Owner first)
    } else {
      this.users.sort((a, b) => a.isSeller ? 1 : -1); // Sort by role (Renter first)
    }
  }

  ngOnInit() {
    this.route.url.subscribe(url => {
      if (url.length > 0 && url[0].path === 'user-management') {
        this.isDashboardVisible = false;
        this.isUserManagementVisible = true;
      } else {
        this.isDashboardVisible = true;
        this.isUserManagementVisible = false;
      }
    });
    this.loadSellers();
    this.loadCount();
    this.loadSellerCount();
    this.loadVerifiedCount();
    this.loadUsers();
  }

  onItemClicked(menuItemIndex: number) {
    if (menuItemIndex === 0) {
      this.isDashboardVisible = true;
      this.isUserManagementVisible = false;
    } else if (menuItemIndex === 1) {
      this.isDashboardVisible = false;
      this.isUserManagementVisible = true;
    }

    this.isMenuOpen = false;
  }

  loadUsers() {
    this.adminService.getUsers().subscribe((data: any[]) => {
      this.users = data;
    });
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
      const verifiedSellers = this.sellers.filter(seller => seller.isSeller && seller.isActiveSeller);
      this.verifiedCount = verifiedSellers.length;
      this.notVerifiedCount = this.sellerCount - this.verifiedCount;
      this.notVerifiedCountLoaded = true; // Indicate that the data is loaded
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

  notifySeller(userId: string) {
    this.showSpinner = true;
    this.adminService.incorrectDocuments(userId).subscribe(
      (res) => {
        Swal.fire({
          title: 'User Notified Successfully',
          icon: 'success',
          iconColor: '#00ff00',
        }).then(() => {
          this.showSpinner = false;
        });
      },
    );
  }

  removeUser(userId: string): void {
    // Display confirmation message
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this user account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deleting the user account
        this.showSpinner = true;
        this.adminService.deleteUser(userId).subscribe(
          (res) => {
            Swal.fire({
              title: 'User Account Deleted',
              text: 'The user account has been deleted.',
              icon: 'success',
              iconColor: '#00ff00',
            }).then(() => {
              this.loadUsers();
              this.loadSellers();
              this.loadCount();
              this.loadSellerCount();
              this.loadVerifiedCount();
              this.showSpinner = false;
            });
          },
          (error) => {
            console.error('Error deleting user account:', error);
          }
        );
      }
    });
}

  logout() {
    this.adminService.logout();
  }
}
