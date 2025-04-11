import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(private router: Router, private loginService: LoginService) {}

  onLogin() {
    const userInput = (document.getElementById('userInput') as HTMLInputElement).value;
    const passwordInput = (document.getElementById('passwordInput') as HTMLInputElement).value;

    if (userInput && passwordInput) {
      const credentials = { username: userInput, password: passwordInput };
      console.log('Đang đăng nhập với thông tin:', credentials);

      this.loginService.login(credentials).subscribe(
        (response: any) => {
          // Lưu thông tin vào LoginService
          this.loginService.setAuthData(response.token, response.username, response.email, response.user_id);

          // Chuyển hướng đến trang /verify
          this.router.navigate(['/verify']);
        },
        (error) => {
          alert('Vui lòng nhập user hoặc password hợp lệ.');
        }
      );
    } else {
      alert('Vui lòng nhập user hoặc password hợp lệ.');
    }
  }
}
