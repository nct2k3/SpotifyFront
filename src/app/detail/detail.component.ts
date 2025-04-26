import { Component, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TranslationsService } from  '../services/Translations/TranslationsService';
import { ArtistsService } from '../services/artists/artists.service';

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
  song: any = null; 
  myplaylist: any[] = [];
  randomSongs: any[] = []; 
  language: number = 0;
  translations: { [key: string]: string } = {};
  artist: any = null;
  
  constructor(
    private songsService: SongsService,
    private route: ActivatedRoute,
    private router: Router,
    private translationsService: TranslationsService,
    private artistsService: ArtistsService
  ) {}

  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    this.language = parseInt(localStorage.getItem('language') || '0');
    
    this.translations = {
      ...this.translationsService.getPageTranslations('detail', this.language),
      ...this.translationsService.getPageTranslations('general', this.language)
    };
    
    if (this.userId) {
      this.songsService.getMyplayList(this.userId).subscribe({
        next: (data: any) => {
          this.myplaylist = data;
        },
        error: (error) => console.error('Error fetching playlist:', error)
      });
    }
this.route.queryParams.subscribe((params) => {
  const id = params['Id'] || params['id'];
  if (id) {
    this.songsService.getTrackById(id).subscribe({
      next: (data: any) => {
        this.song = data; 
        console.log('Song:', this.song);
        

        if (this.song && this.song.artists && this.song.artists.length > 0) {

          const artistId = typeof this.song.artists[0] === 'object' && this.song.artists[0].id 
            ? this.song.artists[0].id  
            : this.song.artists[0];    
          
          if (artistId) {
            this.artistsService.getArtistById(artistId).subscribe({
              next: (artistData: any) => {
                this.artist = artistData;
                console.log('Artist found:', this.artist);
              },
              error: (error) => {
                console.error('Error fetching artist:', error);
              }
            });
          }
        }
      },
      error: (error) => console.error('Error fetching track:', error)
    });
  }
});
    
    this.songsService.getTrack().subscribe((data: any) => {
      this.randomSongs = this.getRandomSongs(data, 5); 
    });
  }
  
  private getRandomSongs(songs: any[], count: number): any[] {
    const shuffled = songs.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, songs.length));
  }
  
  addNewPlaylist(songId: string): void {
    if (!songId) {
      console.error('No song selected');
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
      console.error('FooterComponent not initialized');
    }
  }
  
  getTranslation(key: string): string {
    return this.translations[key] || key;
  }
}