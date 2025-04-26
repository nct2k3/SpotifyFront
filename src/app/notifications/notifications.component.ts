import { Component, OnInit, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { TranslationsService } from  '../services/Translations/TranslationsService';

// Interface for Notification
interface Notification {
  id: string;
  title: string;
  user: string;
  created_at: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  userId: string | null = '';
  newNotificationTitle: string = '';
  isLoading: boolean = false;
  myplaylist: any[] = [];
  sidebarVisible = true;
  language: number = 0;
  translations: { [key: string]: string } = {};

  constructor(
    private songsService: SongsService,
    private router: Router,
    private translationsService: TranslationsService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('user_id');
    this.language = parseInt(localStorage.getItem('language') || '0');
    
    // Load translations
    this.translations = {
      ...this.translationsService.getPageTranslations('notifications', this.language),
      ...this.translationsService.getPageTranslations('admin', this.language)
    };
    
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (!this.userId) {
      this.toast.showMessage(this.getTranslation('notifications.error.nouserid'), 'error');
      return;
    }

    this.isLoading = true;
    this.songsService.getMyNotification(this.userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
        this.toast.showMessage(this.getTranslation('notifications.error.load'), 'error');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
    
    this.songsService.getMyplayList(this.userId).subscribe({
      next: (data: any) => {
        this.myplaylist = data; 
      },
      error: (error) => {
        console.error('Error fetching playlist:', error);
      }
    });
  }
  
  deleteNotification(notificationId: string): void {
    if (confirm(this.getTranslation('notifications.confirm.delete'))) {
      this.isLoading = true;
      this.songsService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.toast.showMessage(this.getTranslation('notifications.success.delete'), 'success');
        },
        error: (err) => {
          this.toast.showMessage(this.getTranslation('notifications.error.delete'), 'error');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  
  clearAllNotifications(): void {
    if (this.notifications.length === 0) {
      this.toast.showMessage(this.getTranslation('notifications.empty'));
      return;
    }
    
    if (confirm(this.getTranslation('notifications.confirm.clearall'))) {
      this.isLoading = true;
      const deleteRequests = this.notifications.map(notification =>
        this.songsService.deleteNotification(notification.id).toPromise()
      );
      
      Promise.all(deleteRequests)
        .then(() => {
          this.notifications = [];
          this.toast.showMessage(this.getTranslation('notifications.success.clearall'), 'success');
        })
        .catch((err) => {
          console.error('Error clearing all notifications:', err);
          this.toast.showMessage(this.getTranslation('notifications.error.clearall'), 'error');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  @ViewChild('toast') toast!: ToastMessageComponent;
  @ViewChild(FooterComponent, { static: false }) footerComponent!: FooterComponent;

  ngAfterViewInit() {
    if (!this.footerComponent) {
      console.error('FooterComponent not initialized');
    }
  }

  nextTrack(data: any): void {
    if (this.footerComponent) {
      this.footerComponent.setTrackData(data, true);
    } else {
      console.error('FooterComponent not initialized');
    }
  }
  
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar visibility:', this.sidebarVisible);
  }
  
  // Helper method to get translations
  getTranslation(key: string): string {
    return this.translations[key] || key;
  }
}