import { Component, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent {
  sidebarVisible = true;
  username: string | null = '';
  email: string | null = '';
  userId: string | null = '';
  song: any = null; // Lưu bài hát từ getTrackById
  myplaylist: any[] = [];

  constructor(
    private songsService: SongsService,
    private route: ActivatedRoute
    , private router: Router
  ) {}

  ngOnInit() {
    // Lấy thông tin user từ localStorage
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    if (this.userId) {
      this.songsService.getMyplayList(this.userId).subscribe({
        next: (data: any) => {
          this.myplaylist = data;
        },
        error: (error) => console.error('Error fetching playlist:', error)
      });
    }

    // Lấy Id từ query params và gọi getTrackById
    this.route.queryParams.subscribe((params) => {
      const id = params['Id'] || params['id']; // Hỗ trợ cả 'Id' và 'id'
      if (id) {
        this.songsService.getTrackById(id).subscribe({
          next: (data: any) => {
            this.song = data; // Lưu bài hát
            console.log('Song:', this.song); // Debug
          },
          error: (error) => console.error('Error fetching track:', error)
        });
      }
    });
  }
  addNewPlaylist(songId: string): void {
    if (!songId) {
      console.error('Không có bài hát được chọn');
      return;
    }
    const playlistData = {
      title: "Test Playlist",
      song_ids: [songId] 
    };
    this.songsService.addPlaylist(playlistData).subscribe({
      next: (response) => {
        console.log('Playlist added:', response);
        window.location.reload();
      },
      error: (error) => {
        console.error('Error adding playlist:', error);
      }
    });
}

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar visibility:', this.sidebarVisible);
  }

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
      console.error('FooterComponent chưa được khởi tạo');
    }
  }
}