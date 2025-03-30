import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(private router: Router) {}

  onLogin() {
    const emailInput = (document.getElementById('emailInput') as HTMLInputElement).value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(emailInput)) {
      this.router.navigate(['/verify'], { queryParams: { email: emailInput } });
    } else {
      alert('Vui lòng nhập một địa chỉ email hợp lệ.');
    }
  }
}


