import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  email: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || 'email của bạn';
    });
  }

  onVerify(verificationCode: string): void {
    if (verificationCode.length === 6) {
      console.log('Mã xác minh:', verificationCode);
      this.router.navigate(['/home']);
    } else {
      alert('Vui lòng nhập mã xác minh gồm 6 chữ số.');
    }
  }
}
