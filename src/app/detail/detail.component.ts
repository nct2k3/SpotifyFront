import { Component, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent {
  sidebarVisible = true; 

  constructor(private songsService: SongsService) {}
  myplaylist: any[] = [];
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; 
    console.log('Sidebar visibility:', this.sidebarVisible);
    this.songsService.getMyplayList("1").subscribe((data: any) => {
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
