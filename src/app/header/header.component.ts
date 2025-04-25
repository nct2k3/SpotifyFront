import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationsService } from  '../services/Translations/TranslationsService';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  userName: string = '';
  userInitial: string = '';
  isMenuOpen: boolean = false;
  searchQuery: string = '';
  language: number = 0;
  translations: { [key: string]: string } = {};
  
  // Language dropdown properties
  isLanguageDropdownOpen: boolean = false;
  flagSrc: string = 'https://tgl-sol.com/images/header/en.png'; // Default to English

  constructor(
    private router: Router,
    private translationsService: TranslationsService
  ) {}

  ngOnInit(): void {
    // Check login status
    const user = localStorage.getItem('user');
    this.isLoggedIn = !!user;
    
    if (this.isLoggedIn) {
      this.userName = user || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
    
    // Get language preference
    this.language = parseInt(localStorage.getItem('language') || '0');
    this.updateFlagSrc();
    
    // Load translations
    this.translations = {
      ...this.translationsService.getPageTranslations('header', this.language),
      ...this.translationsService.getPageTranslations('notifications', this.language),
      ...this.translationsService.getPageTranslations('language', this.language)
    };
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    
    // Close language dropdown if it's open
    if (this.isLanguageDropdownOpen) {
      this.isLanguageDropdownOpen = false;
    }
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
    this.isMenuOpen = false;
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
    this.isMenuOpen = false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    this.isLoggedIn = false;
    this.isMenuOpen = false;
    this.router.navigate(['/login']);
  }

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  // Language dropdown methods
  toggleLanguageDropdown(): void {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    
    // Close profile menu if it's open
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
    }
  }

  closeLanguageDropdown(): void {
    this.isLanguageDropdownOpen = false;
  }

  selectLanguage(languageIndex: number): void {
    this.language = languageIndex;
    localStorage.setItem('language', languageIndex.toString());
    this.updateFlagSrc();
    
    // Update translations
    this.translations = {
      ...this.translationsService.getPageTranslations('header', this.language),
      ...this.translationsService.getPageTranslations('notifications', this.language),
      ...this.translationsService.getPageTranslations('language', this.language)
    };
    
    this.isLanguageDropdownOpen = false;
    
    // Refresh the page to update all component translations
    window.location.reload();
  }

  updateFlagSrc(): void {
    this.flagSrc = this.language === 0 
      ? 'https://tgl-sol.com/images/header/en.png' 
      : 'https://tgl-sol.com/images/header/vn.png';
  }

  // Helper method to get translations
  getTranslation(key: string): string {
    return this.translations[key] || key;
  }
}