import { Component, ViewChild } from '@angular/core';
import { AlbumService } from '../services/album/album.service';
import { ActivatedRoute } from '@angular/router';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { SharedService } from '../services/shared/shared.service';
import { TranslationsService } from '../services/Translations/TranslationsService';

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
    private sharedService: SharedService,
    private translationsService: TranslationsService,
    private  SongsService: SongsService
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
  language: number = 0;
  translations: { [key: string]: string } = {};
  randomSongs: any[] = []; 

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
  private getRandomSongs(songs: any[], count: number): any[] {
    const shuffled = songs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, songs.length));
  }


  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    this.language = parseInt(localStorage.getItem('language') || '0');
    
    // Load translations
    this.translations = {
      ...this.translationsService.getPageTranslations('album', this.language),
      ...this.translationsService.getPageTranslations('general', this.language)
    };
    
    if(this.userId) {
      this.songs.getMyplayList(this.userId).subscribe((data: any) => {
        this.myplaylist = data;
      });
    }
    this.SongsService.getTrack().subscribe((data: any) => {
      this.randomSongs = this.getRandomSongs(data, 5); 
    });
    this.route.queryParams.subscribe((params) => {
      const albumId = params['Id'];
      if (albumId) {
        this.albumService.getAlbumByid(albumId).subscribe((data: any) => {
          console.log('Album data:', data); 
        
          if (data) {
            this.album = data.songs || data.tracks || [];
            this.sharedService.updateSharedData(this.album); 
            this.name = data.title || data.name || this.getTranslation('general.unknownTitle');
            if(data.Album_type === 2){
              this.image = data.image || data.artists[0]?.artist_photo || 'assets/default-album-art.jpg';
            }
            this.image = data.image || data.Album_photo || 'assets/default-album-art.jpg';
            this.NameArtiest = data.artist || data.artists?.[0]?.name || this.getTranslation('general.unknownArtist');
            this.date = data.releaseDate || data.date || 'Unknown Date';
          }
        });
      }
    });

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
      console.error('FooterComponent not initialized');
    }
  }
  
  // Helper method to get translations
  getTranslation(key: string): string {
    return this.translations[key] || key;
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
    this.SongsService.addPlaylist(playlistData).subscribe({
      next: (response) => {
        console.log('Playlist added:', response);
        window.location.reload();
      },
      error: (error) => {
        console.error('Error adding playlist:', error);
      }
    });
  }
}