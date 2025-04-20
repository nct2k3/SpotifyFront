import { Component, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { AlbumService } from '../services/album/album.service';

@Component({
  selector: 'app-list-album',
  templateUrl: './list-album.component.html',
  styleUrls: ['./list-album.component.css']
})
export class ListAlbumComponent {
  songs: any[] = [];
  album: any[] = [];
  myplaylist: any[] = [];
  username: string | null = '';
  email: string | null = '';
  userId: string | null = '';
  sidebarVisible = true;
  isLoading: boolean = false;
  constructor(private songsService: SongsService,private router: Router,private albumService: AlbumService  ) {}

  ngOnInit() {
  this.username = localStorage.getItem('user');
  this.email = localStorage.getItem('email');
  this.userId = localStorage.getItem('user_id');
  this.isLoading = true;
  this.albumService.getAlbum().subscribe((data: any) => {
    this.album = data;
    this.isLoading = false;
  });
  this.songsService.getTrack().subscribe((data: any) => {
    this.songs = data;
  });

  if (this.userId) {
    this.songsService.getMyplayList(this.userId).subscribe({
      next: (data: any) => {
        this.myplaylist = data; 
      },
      error: (error) => {
        console.error('Error fetching playlist:', error);
      }
    });
    
  }
  }
  @ViewChild(FooterComponent, { static: false }) footerComponent!: FooterComponent;

  ngAfterViewInit() {
    if (!this.footerComponent) {
      console.error('FooterComponent chưa được khởi tạo');
    }
  }
  navigateToListSong(){
    this.router.navigate(['/product']);
   }
   navigateToMylistalbum(){
    this.router.navigate(['/allAlbum']);
   }
   navigateToHome(){
    this.router.navigate(['/home']);
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
  navigateToAlbum(Id:any) {
    this.router.navigate(['/album'], {
      queryParams: { Id: Id }
    });
  }
  navigateToDetail(Id:any) {
    this.router.navigate(['/detail'], {
      queryParams: { Id:Id }
    });
  }
}
