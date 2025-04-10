import { Component, OnInit, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { AlbumService } from '../services/album/album.service';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SharedService } from '../services/shared/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  songs: any[] = [];
  album: any[] = [];
  myplaylist : any[] = [];   

  constructor(private songsService: SongsService, private albumService: AlbumService,
    private router: Router , private SharedService:SharedService

  ) {}

  sidebarVisible = true; 

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; 
    console.log('Sidebar visibility:', this.sidebarVisible);
  }
  ngOnInit() {
    this.songsService.getTrack().subscribe((data: any) => {
      this.songs = data;
      this.SharedService.updateSharedData(this.songs)
    });
    this.albumService.getAlbum().subscribe((data: any) => {
      this.album = data;
    });
    this.songsService.getMyplayList("2").subscribe((data: any) => {
      this.myplaylist = data;
    });

  }
 
  
  navigateToAlbum(IdArtistAlbum: any, Name:any, Image: any, NameArtiest: any, date: any ) {
    this.router.navigate(['/album'], {
      queryParams: { IdArtistAlbum, Name, Image, NameArtiest, date }
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
        this.footerComponent.setTrackData(data);
        this.footerComponent.togglePlay();
      } else {
        console.error('FooterComponent chưa được khởi tạo');
      }
    }

  
}
