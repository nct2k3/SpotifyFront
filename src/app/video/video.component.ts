import { Component, ViewChild } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { ActivatedRoute } from '@angular/router';
import { SongsService } from '../services/Songs/songs.service';
@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent {
  name: string = '';
  image: string = '';
  NameArtiest: string = '';
  date: string = '';
  link:any;
  sidebarVisible = true; 
  myplaylist: any[] = [];

  constructor(private route: ActivatedRoute, private songsService: SongsService   ) { }

  @ViewChild(FooterComponent, { static: false }) footerComponent!: FooterComponent;

ngOnInit() {
  this.route.queryParams.subscribe((params) => {
  
    this.name = params['name'] || '';
    this.image = params['image'] || '';
    this.NameArtiest = params['NameArtiest'] || '';
    this.date = params['date'] || '';
    this.link = params['link'] || ''; 
  });

  this.songsService.getMyplayList("1").subscribe((data: any) => {
    this.myplaylist = data;
  });
}

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible; // Toggle state
    console.log('Sidebar visibility:', this.sidebarVisible); 
  }


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
