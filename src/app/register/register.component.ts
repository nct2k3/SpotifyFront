import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  step: number = 1; // Quản lý bước hiện tại
  email: string = ''; // Lưu email người dùng nhập
  isEmailValid: boolean = false; // Trạng thái hợp lệ của email
  password: string = ''; // Lưu mật khẩu người dùng nhập
  confirmPassword: string = ''; // Lưu mật khẩu nhập lại
  hasLetter: boolean = false; // Kiểm tra có chữ cái
  hasNumberOrSpecial: boolean = false; // Kiểm tra có số hoặc ký tự đặc biệt
  hasMinLength: boolean = false; // Kiểm tra độ dài tối thiểu
  isPasswordValid: boolean = false; // Kiểm tra mật khẩu hợp lệ
  passwordsMatch: boolean = false; // Kiểm tra mật khẩu khớp nhau

  // Thông tin bước 3
  userName: string = '';
  firstName: string = '';
  lastName: string = '';

  errorMessage: string = '';

  constructor(private registerService: RegisterService, private router: Router) {}

  nextStep(): void {
    if (this.step < 3) {
      this.step++;
    }
  }
  previousStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  // Kiểm tra định dạng email
  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra định dạng email
    this.isEmailValid = emailRegex.test(this.email);
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

  submitRegistration(): void {
    const payload = {
      username: this.userName,
      password: this.password,
      password2: this.confirmPassword,
      email: this.email,
      first_name: this.firstName,
      last_name: this.lastName,
    };

    this.registerService.register(payload).subscribe(
      (response) => {
        this.errorMessage = ''; // Xóa thông báo lỗi nếu đăng ký thành công
        alert('Đăng ký thành công!');
        this.router.navigate(['/login']);
      },
      (error) => {
        if (error.status === 400) {
          this.errorMessage = 'Tên người dùng đã tồn tại trong hệ thống.';
        } else {
          this.errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
        }
      }
    );
  }

  clearErrorMessage(): void {
    this.errorMessage = '';
  }
}
