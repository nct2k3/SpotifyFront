import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  username: string = ''; // Tên người dùng (chỉ xem)
  email: string = ''; // Email
  firstName: string = ''; // Tên
  lastName: string = ''; // Họ

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Gọi API để lấy thông tin người dùng
  loadUserProfile(): void {
    this.profileService.getUserProfiles().subscribe(
      (response) => {
        this.username = response.username;
        this.email = response.email;
        this.firstName = response.first_name;
        this.lastName = response.last_name;
      },
      (error) => {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        alert('Không thể tải thông tin người dùng. Vui lòng thử lại.');
      }
    );
  }

  changePassword(): void {
    alert('Chức năng đổi mật khẩu chưa được triển khai.');
  }

  saveProfile(): void {
    const updatedProfile = {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
    };

    console.log('Thông tin đã lưu:', updatedProfile);
    alert('Hồ sơ đã được cập nhật!');
  }

  cancelEdit(): void {
    alert('Hủy chỉnh sửa.');
  }
}
