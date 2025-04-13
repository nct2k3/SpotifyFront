import { Component, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { SharedService } from '../services/shared/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-play-list',
  templateUrl: './my-play-list.component.html',
  styleUrls: ['./my-play-list.component.css']
})
export class MyPlayListComponent {
  username: string | null = '';
  email: string | null = '';
  userId: string | null = '';
  sidebarVisible = true;
  songs: any[] = [];
  myplaylist: any[] = [];


  constructor(private songsService: SongsService, private sharedService: SharedService,private router: Router) {}

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar visibility:', this.sidebarVisible);
  }

  ngOnInit() {
    // Lấy dữ liệu từ localStorage
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
  

    // Kiểm tra userId trước khi gọi API
    if (this.userId) {
      this.songsService.getMyplayList(this.userId).subscribe({
        next: (data: any) => {
          this.songs = data;
          this.myplaylist = data; 
          this.sharedService.updateSharedData(this.songs); 
        },
        error: (error) => {
          console.error('Error fetching playlist:', error);
        }
      });
    } else {
      this.router.navigate(['/login']); 
    }
  }

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
}