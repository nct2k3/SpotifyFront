import { Component, OnInit, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  songs: any[] = [];
  

  constructor(private songsService: SongsService) {}

  ngOnInit() {
    this.songsService.getTrack().subscribe((data: any) => {
      this.songs = data;
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
