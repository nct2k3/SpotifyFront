import { Component, ViewChild } from '@angular/core';
import { AlbumService } from '../services/album/album.service';
import { ActivatedRoute } from '@angular/router';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
@Component({
  selector: 'app-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.css']
})
export class AlbumComponent {

   constructor(private albumService: AlbumService,private route : ActivatedRoute , private songs: SongsService  ) { }

   album: any[] = [];
   name: any;
   image: any;
   NameArtiest: any;
   date: any;
   sidebarVisible = true;
   myplaylist: any[] = [];

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
   ngOnInit() {
    this.songs.getMyplayList("2").subscribe((data: any) => {
      this.myplaylist = data;
    });
    this.route.queryParams.subscribe((params) => {
      
      this.songs.getAlbum(params['IdArtistAlbum']).subscribe((data: any) => {
        this.name = params['Name']
        this.image = params['Image']
        this.NameArtiest = params['NameArtiest']
        this.date = params['date']
        this.album = data;
      });
   
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
