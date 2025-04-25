import { Component, OnInit, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { AlbumService } from '../services/album/album.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../services/shared/shared.service';
import { TranslationsService } from '../services/Translations/TranslationsService';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  songs: any[] = [];
  album: any[] = [];
  myplaylist: any[] = [];
  
  username: string | null = '';
  email: string | null = '';
  userId: string | null = '';
  
  albumcustom: any[] = [];
  language: number = 1;
  isLoading: boolean = false;
  translations: { [key: string]: string } = {};
  
  constructor(
    private songsService: SongsService, 
    private albumService: AlbumService,
    private router: Router, 
    private sharedService: SharedService,
    private translationsService: TranslationsService
  ) {}
  
  sidebarVisible = true;
  
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar visibility:', this.sidebarVisible);
  }
  
  ngOnInit() {
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
    this.language = parseInt(localStorage.getItem('language') || '0');
    
    // Load translations
    this.translations = this.translationsService.getPageTranslations('home', this.language);
    
    this.isLoading = true;
    this.songsService.getTrack().subscribe((data: any) => {
      this.songs = data;
      this.sharedService.updateSharedData(this.songs);
    });
    
    this.albumService.getAlbum().subscribe((data: any) => {
      this.album = data;
      this.albumcustom = data.filter((item: any) => item.Album_type === 1);
      this.isLoading = false;
    });
    
    if (this.userId) {
      this.songsService.getMyplayList(this.userId).subscribe((data: any) => {
        this.myplaylist = data;
      });
    }
  }
  
  navigateToDetail(Id: any) {
    this.router.navigate(['/detail'], {
      queryParams: { Id: Id }
    });
  }
  
  navigateToListSong() {
    this.router.navigate(['/product']);
  }
  
  navigateToMylistalbum() {
    this.router.navigate(['/allAlbum']);
  }
  
  navigateToAlbum(Id: any) {
    this.router.navigate(['/album'], {
      queryParams: { Id: Id }
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
  
  // Helper method to get translations
  getTranslation(key: string): string {
    return this.translations[key] || key;
  }
}