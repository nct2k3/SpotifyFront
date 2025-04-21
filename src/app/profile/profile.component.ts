import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profile/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  username: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  oldPassword: string = ''; // Mật khẩu cũ
  password: string = ''; // Mật khẩu mới
  confirmPassword: string = ''; // Xác nhận mật khẩu
  showPasswordForm: boolean = false; // Hiển thị form đổi mật khẩu
  hasLetter: boolean = false;
  hasNumberOrSpecial: boolean = false;
  hasMinLength: boolean = false;
  passwordsMatch: boolean = false;
  isEmailValid: boolean = false; // Trạng thái hợp lệ của email
  isPasswordValid: boolean = false;

  constructor(private profileService: ProfileService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Gọi API để lấy thông tin người dùng
  loadUserProfile(): void {
    this.profileService.getUserProfile().subscribe(
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

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.password = '';
    this.confirmPassword = '';
    this.resetPasswordValidation();
  }

  // Kiểm tra định dạng email
  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra định dạng email
  this.isEmailValid = emailRegex.test(this.email.trim());
  }

  // Kiểm tra mật khẩu
  validatePassword(): void {
    const letterRegex = /[a-zA-Z]/; // Regex kiểm tra chữ cái
    const numberOrSpecialRegex = /[\d!@#$%^&*(),.?":{}|<>]/; // Regex kiểm tra số hoặc ký tự đặc biệt
    this.hasLetter = letterRegex.test(this.password);
    this.hasNumberOrSpecial = numberOrSpecialRegex.test(this.password);
    this.hasMinLength = this.password.length >= 10;
    this.passwordsMatch = this.password === this.confirmPassword;
    this.isPasswordValid = this.hasLetter && this.hasNumberOrSpecial && this.hasMinLength;
  }

  resetPasswordValidation(): void {
    this.hasLetter = false;
    this.hasNumberOrSpecial = false;
    this.hasMinLength = false;
    this.passwordsMatch = false;
    this.isPasswordValid = false;
  }

  changePassword(): void {
    if (!this.isPasswordValid || !this.passwordsMatch) {
      alert('Mật khẩu không hợp lệ hoặc không khớp!');
      return;
    }

    const updatedProfile = {
      password: this.password,
    };

    this.profileService.updateUserProfile(updatedProfile).subscribe(
      (response) => {
        console.log('Đổi mật khẩu thành công:', response);
        alert('Mật khẩu đã được đổi thành công!');
        this.togglePasswordForm();
      },
      (error) => {
        console.error('Lỗi khi đổi mật khẩu:', error.error);
        alert('Không thể đổi mật khẩu. Vui lòng thử lại.');
      }
    );
  }

  saveProfile(): void {
    // Tạo đối tượng chứa thông tin cập nhật
    const updatedProfile: any = {
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
      username: this.username, // Tên đăng nhập
      is_staff: false, // Hoặc giá trị phù hợp với người dùng
    };
  
     // Chỉ thêm mật khẩu nếu người dùng nhập mật khẩu mới
    if (this.password) {
      if (this.password !== this.confirmPassword) {
        alert('Mật khẩu xác nhận không khớp!');
        return;
      }
      updatedProfile.password = this.password;
    } else if (this.oldPassword) {
      updatedProfile.password = this.oldPassword; // Nếu có mật khẩu cũ, thêm vào đối tượng
    }

    updatedProfile.is_staff = localStorage.getItem('is_staff') == 'true';
    updatedProfile.is_superuser = localStorage.getItem('is_superuser') == 'true';;

    // Kiểm tra nếu không có thay đổi nào trong thông tin
    if (
      this.username == '' &&
      this.email == '' &&
      this.firstName == '' &&
      this.lastName == '' &&
      !this.password
    ) {
      alert('Không có thay đổi nào được thực hiện.');
      this.router.navigate(['/home']); // Chuyển hướng về trang chủ
      return;
    }
  
    console.log('Dữ liệu gửi đến API:', updatedProfile);
  
    // Gửi dữ liệu cập nhật đến API
    this.profileService.updateUserProfile(updatedProfile).subscribe(
      (response) => {
        console.log('Cập nhật thành công:', response);
        alert('Hồ sơ đã được cập nhật!');
        this.password = ''; // Xóa mật khẩu sau khi cập nhật
        this.confirmPassword = '';
        this.router.navigate(['/home']); // Chuyển hướng về trang chủ
      },
      (error) => {
        console.error('Chi tiết lỗi:', error.error);
        if (error.error.email) {
          alert(`Lỗi email: ${error.error.email}`);
        } else if (error.error.first_name) {
          alert(`Lỗi tên: ${error.error.first_name}`);
        } else if (error.error.last_name) {
          alert(`Lỗi họ: ${error.error.last_name}`);
        } else if (error.error.username) {
          alert(`Lỗi tên đăng nhập: ${error.error.username}`);
        } else if (error.error.password) {
          alert(`Lỗi mật khẩu: ${error.error.password}`);
        } else if (error.error.is_staff) {
          alert(`Lỗi quyền truy cập: ${error.error.is_staff}`);
        } else {
          alert('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
        }
      }
    );
  }
  cancelEdit(): void {
    this.router.navigate(['/home']); // Chuyển hướng về trang chủ
  }
}
