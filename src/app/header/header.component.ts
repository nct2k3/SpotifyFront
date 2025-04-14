import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login/login.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isLoggedIn: boolean = false;
  userName: string = '';
  userInitial: string = '';
  isMenuOpen: boolean = false;
  searchQuery: string = ''; // Store the search input

  constructor(private router: Router, private loginService: LoginService) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.isLoggedIn = true;
      this.userName = localStorage.getItem('user') || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    } else {
      this.isLoggedIn = false;
    }
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToAbout() {
    this.router.navigate(['/album']);
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToProfile(): void {
    this.isMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.isMenuOpen = false;
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.isMenuOpen = false;
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}