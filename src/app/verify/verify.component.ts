import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
})
export class VerifyComponent implements OnInit {
  token: string = '';
  user: string = '';
  email: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    const authData = this.loginService.getAuthData();
    this.token = authData.token;
    this.user = authData.user;
    this.email = authData.email;

    if (this.token && this.user && this.email) {
      // Nếu có token, user và email thì redirect đến trang /home
      this.router.navigate(['/home']);
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
