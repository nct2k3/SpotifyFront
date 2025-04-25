import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TranslationsService } from  '../services/Translations/TranslationsService';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Input() sidebarVisible: boolean = true;
  @Input() myplaylist: any[] = [];
  
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  @Output() nextTrackEvent = new EventEmitter<any>();
  
  username: string | null = '';
  email: string | null = '';
  userId: string | null = '';
  language: number = 0;
  translations: { [key: string]: string } = {};

  constructor(private translationsService: TranslationsService) {}

  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    this.language = parseInt(localStorage.getItem('language') || '0');
    
    // Load translations
    this.translations = {
      ...this.translationsService.getPageTranslations('sidebar', this.language),
      ...this.translationsService.getPageTranslations('general', this.language)
    };
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  nextTrack(item: any) {
    this.nextTrackEvent.emit(item);
  }
  
  // Helper method to get translations
  getTranslation(key: string): string {
    return this.translations[key] || key;
  }
}