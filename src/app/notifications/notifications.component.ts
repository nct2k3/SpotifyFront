import { Component, OnInit, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

// Interface cho Notification
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

  constructor(
    private songsService: SongsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('user_id');
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (!this.userId) {
      this.toast.showMessage('Không tìm thấy user ID!', 'error');
      return;
    }

   this.isLoading = true;
    this.songsService.getMyNotification(this.userId).subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      },
      error: (err) => {
        console.error('Lỗi khi tải thông báo:', err);
        this.toast.showMessage('Lỗi tải thông báo!', 'error');
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
    if (confirm('Bạn có chắc muốn xóa thông báo này?')) {
      this.isLoading = true;
      this.songsService.deleteNotification(notificationId).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.toast.showMessage('Xóa thông báo thành công!', 'success');
        },
        error: (err) => {
          this.toast.showMessage('Xóa thông báo thất bại!', 'error');
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
  clearAllNotifications(): void {
    if (this.notifications.length === 0) {
      this.toast.showMessage('Không có thông báo để xóa!');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa tất cả thông báo?')) {
      this.isLoading = true;
      const deleteRequests = this.notifications.map(notification =>
        this.songsService.deleteNotification(notification.id).toPromise()
      );
      Promise.all(deleteRequests)
        .then(() => {
          this.notifications = [];
          this.toast.showMessage('Đã xóa tất cả thông báo!', 'success');
        })
        .catch((err) => {
          console.error('Lỗi khi xóa tất cả thông báo:', err);
          this.toast.showMessage('Xóa tất cả thông báo thất bại!', 'error');
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
      console.error('FooterComponent chưa được khởi tạo');
    }
  }

  nextTrack(data: any): void {
    if (this.footerComponent) {
      this.footerComponent.setTrackData(data, true);
    } else {
      console.error('FooterComponent chưa được khởi tạo');
    }
  }
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar visibility:', this.sidebarVisible);
  }
}