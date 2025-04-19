import { Component, ViewChild } from '@angular/core';
import { AlbumService } from '../services/album/album.service';
import { ActivatedRoute } from '@angular/router';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { SharedService } from '../services/shared/shared.service';
@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent {
  constructor(
    private albumService: AlbumService,
    private route: ActivatedRoute,
    private songs: SongsService,
    private sharedService: SharedService
  ) {}

  album: any[] = [];
  name: string | undefined;
  image: string | undefined;
  NameArtiest: string | undefined;
  date: string | undefined;
  Id: any;
  sidebarVisible = true;
  myplaylist: any[] = [];
  username: string | null = null;
  email: string | null = null;
  userId: string | null = null;


  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    if(this.userId){
    this.songs.getMyplayList(this.userId).subscribe((data: any) => {
      this.myplaylist = data;
    });
  }
    this.route.queryParams.subscribe((params) => {
      const albumId = params['Id'];
      if (albumId) {
        this.albumService.getAlbumByid(albumId).subscribe((data: any) => {
          console.log('Album data:', data); 
        
          if (data) {
            this.album = data.songs || data.tracks || [];
            this.sharedService.updateSharedData(this.album); 
            this.name = data.title || data.name || 'Unknown Album';
            if(data.Album_type === 2){
              this.image = data.image || data.artists[0]?.artist_photo  || 'assets/default-album-art.jpg';
            }
            this.image = data.image || data.Album_photo || 'assets/default-album-art.jpg';
            this.NameArtiest = data.artist || data.artists?.[0]?.name || 'Unknown Artist';
            this.date = data.releaseDate || data.date || 'Unknown Date';
          }
        });
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