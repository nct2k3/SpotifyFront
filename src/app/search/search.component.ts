import { Component, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {


  constructor( private songsService: SongsService) { }
  myplaylist: any[] = [];
  sidebarVisible = true; 

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; 
    console.log('Sidebar visibility:', this.sidebarVisible);
  }

  ngOnInit() {
    
    
    this.songsService.getMyplayList("2").subscribe((data: any) => {
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
