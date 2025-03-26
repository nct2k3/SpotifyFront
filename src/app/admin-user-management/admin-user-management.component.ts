import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css']
})
export class AdminUserManagementComponent {
  searchTerm: string = ''; // Dùng để tìm kiếm người dùng
  users = [
    { id: 1, username: 'join', first_name: 'John', last_name: 'Doe', email: 'john@example.com', role: 'Admin'},
    { id: 2, username:'jane', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', role: 'User'},
    { id: 3, username: 'bob', first_name: 'Bob', last_name: 'Brown', email: 'bob@example.com', role: 'User'},
    { id: 4, username: 'bob', first_name: 'Bob', last_name: 'Brown', email: 'aliceeeeeeeeeeeeeeeeeeeeeeeeee@example.com', role: 'Admin'},
    { id: 4, username: 'bob', first_name: 'Bob', last_name: 'Brown', email: 'alice@example.com', role: 'Admin'},
    { id: 4, username: 'bob', first_name: 'Bob', last_name: 'Brown', email: 'alice@example.com', role: 'Admin'},
  ];

  // Hàm lọc người dùng theo từ khóa tìm kiếm
  filteredUsers() {
    return this.users.filter(user => {
      return user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
             user.email.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  // Chức năng edit người dùng (hiện tại chỉ là một phương thức mẫu)
  editUser(user: any) {
    console.log('Editing user:', user);
    // Bạn có thể mở một modal hoặc trang chỉnh sửa ở đây
  }

  // Chức năng xóa người dùng
  deleteUser(userId: number) {
    this.users = this.users.filter(user => user.id !== userId);
    console.log('User deleted with id:', userId);
  }
}
