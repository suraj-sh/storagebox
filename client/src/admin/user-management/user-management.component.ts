import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent {

  users: any[] = [];

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe((data: any[]) => {
      this.users = data;
    });
  }

  removeUser(userId: string) {
    this.adminService.deleteUser(userId).subscribe(
      (res) => {
        Swal.fire({
          title: 'User Account Deleted',
          icon: 'success',
          iconColor: '#00ff00',
        }).then(() => {
          this.loadUsers();
        });
      },
    );
  }
}
