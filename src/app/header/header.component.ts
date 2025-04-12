import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isLoggedIn: boolean = false; // Trạng thái đăng nhập
  userName: string = ''; // Tên người dùng
  userInitial: string = ''; // Chữ cái đầu tiên của tên người dùng
  isMenuOpen: boolean = false; // Trạng thái hiển thị menu

  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.isLoggedIn = true;
      this.userName = localStorage.getItem('user') || '';
      this.userInitial = this.userName.charAt(0).toUpperCase(); // Lấy chữ cái đầu tiên và viết hoa
    } else {
      this.isLoggedIn = false;
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']); // Điều hướng đến trang đăng nhập
  }

  goToAbout() {
    this.router.navigate(['/album']); 
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; // Đổi trạng thái hiển thị menu
  }

  navigateToProfile(): void {
    this.isMenuOpen = false; // Đóng menu
    this.router.navigate(['/profile']); // Điều hướng đến trang Hồ sơ
  }

  navigateToSettings(): void {
    this.isMenuOpen = false; // Đóng menu
    this.router.navigate(['/settings']); // Điều hướng đến trang Cài đặt
  }

  logout(): void {
    this.isMenuOpen = false; // Đóng menu
    this.loginService.logout(); // Gọi hàm logout từ LoginService
    this.router.navigate(['/login']); // Điều hướng đến trang Đăng nhập
  }
}
