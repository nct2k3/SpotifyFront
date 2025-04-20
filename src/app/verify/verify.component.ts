import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css'],
})
export class VerifyComponent implements OnInit {
  user: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      if (localStorage.getItem('is_staff') == 'true') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/home';
      }
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
