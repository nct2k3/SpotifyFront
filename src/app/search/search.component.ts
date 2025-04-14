import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SongsService } from '../services/Songs/songs.service';
import { FooterComponent } from '../footer/footer.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  searchResults: any[] = [];
  myplaylist: any[] = [];
  sidebarVisible = true;

  constructor(
    private route: ActivatedRoute,
    private songsService: SongsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const username = localStorage.getItem('user');
    const email = localStorage.getItem('email');
    const userId = localStorage.getItem('user_id');

    if (userId) {
      this.songsService.getMyplayList(userId).subscribe((data: any) => {
        this.myplaylist = data;
      });
    }

    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.fetchSearchResults(this.searchQuery);
      }
    });
  }

  fetchSearchResults(query: string): void {
    this.songsService.getTrack().subscribe(
      (data: any[]) => {
        this.searchResults = data.filter(song =>
          song.title.toLowerCase().includes(query.toLowerCase())
        );
      },
      (error) => {
        console.error('Error fetching search results:', error);
        this.searchResults = [];
      }
    );
  }
  navigateToDetail(Id:any) {
    this.router.navigate(['/detail'], {
      queryParams: { Id:Id }
    });
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar visibility:', this.sidebarVisible);
  }

  @ViewChild(FooterComponent, { static: false }) footerComponent!: FooterComponent;

  ngAfterViewInit(): void {
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
}