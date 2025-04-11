import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  step: number = 1; // Quản lý bước hiện tại
  password: string = ''; // Lưu mật khẩu người dùng nhập
  hasLetter: boolean = false; // Kiểm tra có chữ cái
  hasNumberOrSpecial: boolean = false; // Kiểm tra có số hoặc ký tự đặc biệt
  hasMinLength: boolean = false; // Kiểm tra độ dài tối thiểu
  isPasswordValid: boolean = false; // Kiểm tra mật khẩu hợp lệ

  // Thông tin bước 3
  name: string = '';
  birthDay: string = '';
  birthMonth: string = '';
  birthYear: string = '';
  gender: string = '';
  months: string[] = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ];

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
  validatePassword(): void {
    const letterRegex = /[a-zA-Z]/; // Regex kiểm tra chữ cái
    const numberOrSpecialRegex = /[\d!@#$%^&*(),.?":{}|<>]/; // Regex kiểm tra số hoặc ký tự đặc biệt
    this.hasLetter = letterRegex.test(this.password);
    this.hasNumberOrSpecial = numberOrSpecialRegex.test(this.password);
    this.hasMinLength = this.password.length >= 10;
    this.isPasswordValid = this.hasLetter && this.hasNumberOrSpecial && this.hasMinLength;
  }

  submitRegistration(): void {
    console.log('Tên:', this.name);
    console.log('Ngày sinh:', `${this.birthDay}/${this.birthMonth}/${this.birthYear}`);
    console.log('Giới tính:', this.gender);
    alert('Đăng ký thành công!');
  }
}
