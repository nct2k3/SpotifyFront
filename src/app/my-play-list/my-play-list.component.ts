import { Component, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { SharedService } from '../services/shared/shared.service';

@Component({
  selector: 'app-my-play-list',
  templateUrl: './my-play-list.component.html',
  styleUrls: ['./my-play-list.component.css']
})
export class MyPlayListComponent {

  constructor(private songsService: SongsService, private SharedService:SharedService ) {}
  sidebarVisible = true; 

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; 
    console.log('Sidebar visibility:', this.sidebarVisible);
  }

  songs: any[] = [];
  myplaylist: any[] = [];
  ngOnInit() {
    this.songsService.getMyplayList().subscribe((data: any) => {
      this.songs = data;
      this.SharedService.updateSharedData(this.songs)
    });
    this.songsService.getMyplayList().subscribe((data: any) => {
      this.myplaylist = data;
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
