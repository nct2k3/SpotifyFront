import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
})
export class VerifyComponent implements OnInit {
  token: string = '';
  user: string = '';
  email: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
    this.user = localStorage.getItem('user') || '';
    this.email = localStorage.getItem('email') || '';

    if (this.token && this.user && this.email) {
      // Đảm bảo các giá trị đã được tải trước khi điều hướng nên dùng window.location.href
      window.location.href = '/home'; 
    } else {
      this.router.navigate(['/login']);
    }
  }

  onVerify(verificationCode: string): void {
    console.log('Mã xác minh:', verificationCode);
    if (verificationCode.length === 6) {
      console.log('Mã xác minh:', verificationCode);
      this.router.navigate(['/home']);
    } else {
      alert('Vui lòng nhập mã xác minh gồm 6 chữ số.');
    }
  }
}
