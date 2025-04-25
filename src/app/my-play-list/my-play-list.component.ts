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
  randomSongs: any[] = [];

  myplaylistAll: any[] = [];
  
  isLoading: boolean = false;


  constructor(private songsService: SongsService, private sharedService: SharedService,private router: Router) {}

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar visibility:', this.sidebarVisible);
  }
  private getRandomSongs(songs: any[], count: number): any[] {
    const shuffled = songs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, songs.length));
  }

  ngOnInit() {
    // Lấy dữ liệu từ localStorage
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    this.isLoading = true;
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

      this.songsService.getMyplayListAll(this.userId).subscribe({
        next: (data: any) => {
          this.myplaylistAll = data;
         console.log(this.myplaylistAll);
        },
        error: (error) => {
          console.error('Error fetching playlist:', error);
        }
      })
      
      this.songsService.getTrack().subscribe((data: any) => {
        this.randomSongs = this.getRandomSongs(data, 5); 
      });

      this.isLoading = false;
      
    } else {
      this.router.navigate(['/login']); 
    }
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
  deleteMyplaylist(Id:string){

    this.songsService.deletePlaylist(Id).subscribe({
      next: (data: any) => {
        console.log(data);
        this.songsService.getMyplayList(Id).subscribe({
          next: (data: any) => {
            this.songs = data;
            this.myplaylist = data;
            this.sharedService.updateSharedData(this.songs);
            window.location.reload();
          },
          error: (error) => {
            console.error('Error fetching playlist:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching playlist:', error);
      }
    });
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