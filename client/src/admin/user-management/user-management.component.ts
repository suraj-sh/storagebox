import { Component } from '@angular/core';
import { AdminService } from '../admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {

  users: any[] = [];
  sortByRoleOrder: boolean = false;
  showSpinner = false;

  constructor(private adminService: AdminService) { }

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
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe((data: any[]) => {
      this.users = data;
    });
  }

  removeUser(userId: string) {
    this.showSpinner = true;
    this.adminService.deleteUser(userId).subscribe(
      (res) => {
        Swal.fire({
          title: 'User Account Deleted',
          icon: 'success',
          iconColor: '#00ff00',
        }).then(() => {
          this.loadUsers();
          this.showSpinner = false;
        });
      },
    );
  }
}