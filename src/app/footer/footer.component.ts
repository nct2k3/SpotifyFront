import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { SharedService } from '../services/shared/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  @ViewChild('audioPlayer', { static: true }) audioPlayer!: ElementRef<HTMLAudioElement>;

  currentTrack: any = null; 
  isPlaying: boolean = false; 
  isMuted: boolean = false;
  currentTime: number = 0; 
  duration: number = 0; 
  progress: number = 0; 
  volume: number = 50; 
  sharedData: any[] = [];
  
  constructor(private songsService: SongsService , private  sharedService: SharedService ,  private router: Router) {}

  
  data = {
    title: "Chạy Ngay Đi",
    artists: [
      {
        id: "67d635e07f87f7f6ac109002",
        name: "Sơn Tùng M-TP",
        bio: "This is a test artist",
        debut_year: 2025
      }
    ],
    genre: "Nhạc Trẻ",
    image_location: "../../assets/Img/image5.png",
    file_location: "../../assets/Songs/ChayNgayDi-SonTungMTP-5468704.mp3",
    duration: 3.14
  };

  ngOnInit(): void {
    this.fetchTrackData();
  
 
    this.sharedService.sharedData$.subscribe((data) => {
      this.sharedData = data;
      console.log('Data received in sharedData:', this.sharedData);
  
  
      if (this.sharedData.length === 0) {
        console.log('No data available in sharedData');
      }
    });
  }
  goToVideo( Name:any, Image: any, NameArtiest: any,link :any ) {
    this.router.navigate(['/video'], {
      queryParams: { Name, Image, NameArtiest,link }
    });
  }
  


  fetchTrackData(): void {

    this.setTrackData(this.data);
  }

  setTrackData(data: any): void {
    this.currentTrack = {
      name: data.title,
      artist: data.artists[0]?.name || 'Unknown Artist',
      image_location: data.image_location || 'default-album-art.jpg',
      url: data.file_location,
      duration: data.duration
    };
  
    this.duration = data.duration * 60; 
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.src = this.currentTrack.url;
      this.audioPlayer.nativeElement.load(); 
    }
  }
  

  togglePlay(): void {
    if (this.audioPlayer) {
      const audio = this.audioPlayer.nativeElement;
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }

previousTrack(): void {
  const currentIndex = this.sharedData.findIndex(track => track.title === this.currentTrack.name);
  let newTrack;
  if (currentIndex > 0) {
    newTrack = this.sharedData[currentIndex - 1];
  } else {
    newTrack = this.sharedData[this.sharedData.length - 1];
  }
  if (newTrack) {
    this.setTrackData(newTrack);
    if (this.isPlaying) {
      this.togglePlay();
    }
  }
}

  nextTrack(): void {

    const currentIndex = this.sharedData.findIndex(track => track.title === this.currentTrack.name);
    const newTrack = currentIndex < this.sharedData.length - 1 
      ? this.sharedData[currentIndex + 1]
      : this.sharedData[0];
    this.setTrackData(newTrack);
    this.togglePlay();

  }

  updateProgress(event: any): void {
    const audio = event.target as HTMLAudioElement;
    this.currentTime = audio.currentTime;
    this.duration = audio.duration || this.duration;
    this.progress = (this.currentTime / this.duration) * 100;
  }

  seekTo(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.currentTime = position * this.duration;
      this.progress = position * 100;
    }
  }

  toggleMute(): void {
    if (this.audioPlayer) {
      this.isMuted = !this.isMuted;
      this.audioPlayer.nativeElement.muted = this.isMuted;
    }
  }

  adjustVolume(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    this.volume = Math.max(0, Math.min(100, position * 100));
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.volume = this.volume / 100;
    }
  }

  toggleQueue(): void {
    console.log('Toggle queue');
    // Logic xử lý hàng đợi bài hát (nếu cần)
  }

  
}


