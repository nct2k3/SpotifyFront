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
  showLyrics: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  progress: number = 0;
  volume: number = 50;
  sharedData: any[] = [];

  constructor(
    private songsService: SongsService,
    private sharedService: SharedService,
    private router: Router
  ) {}

  data = {
    title: "Chạy Ngay Đi",
    artists: [{
      id: "67d635e07f87f7f6ac109002",
      name: "Sơn Tùng M-TP",
      bio: "This is a test artist",
      debut_year: 2025
    }],
    genre: "Nhạc Trẻ",
    image_location: "../../assets/Img/image5.png",
    file_location: "../../assets/Songs/cnd.mp4",
    duration: 3.14,
    lyrics: "Nắng ấm xa dần rồi Nắng ấm xa dần rồi Nắng ấm xa dần bỏ rơi để lại những giấc mơ Giữ lại đi giữ giữ lại đi Nắng ấm xa dần rồi Nắng ấm xa dần rồi Nắng ấm xa dần xa dần theo những tiếng cười Hãy mang đi giúp những nỗi buồn Theo thời gian những hạt mưa như nặng thêm Xóa hết thương yêu mặn nồng ngày nào giữa chúng ta Anh lục tìm vẫn cứ mãi lục tìm Giơ bàn tay cố kìm nén những cảm xúc Vùi mình vào đêm đen anh chẳng tìm thấy lối ra oh oh Sau lưng là tiếng nói yêu anh chẳng rời xa anh (uh uh) Trước mắt anh điều đấy nó dối trá tại sao người vội quên mau (là vì em) Bài ca anh viết sẽ không được trọn vẹn đâu em (vội bước đi) Em yêu một ai thật rồi mãi chẳng là anh đâu Vậy thì người cứ bước đi xa nơi này Ánh bình minh sẽ không còn nơi đây Bước đi xa nơi này Những lời yêu sẽ không còn nơi đây Phải tự đứng lên mà thôi Che nhẹ đi những niềm đau và nỗi buồn Xung quanh anh giờ đây cô đơn mình anh ôm giấc mơ (vì ai) Nhìn em bước ra đi xa dần (hoh) Nhìn em bước ra đi xa dần (hoh) Nhìn em bước ra đi xa dần (hoh) Nhìn em bước ra đi xa dần (hoh) M T P Đến rồi lại đi và cứ vội vàng đi Trao cho anh bao yêu thương rồi em lại bỏ đi Gieo cho anh bao nhiêu niềm đau rồi em mau rời bỏ anh xa anh Quay mặt lặng lẽ quên mau Uh em yêu quên thật rồi Uh chẳng một lời chia ly Quên rồi em yêu quên rồi quên rồi Vậy thì người cứ bước đi xa nơi này Ánh bình minh sẽ không còn nơi đây Bước đi xa nơi này Những lời yêu sẽ không còn nơi đây Phải tự đứng lên mà thôi Che nhẹ đi những niềm đau và nỗi buồn Xung quanh anh giờ đây cô đơn mình anh ôm giấc mơ (là vì ai) Vậy thì người cứ bước đi xa nơi này Ánh bình minh sẽ không còn nơi đây Bước đi xa nơi này Những lời yêu sẽ không còn nơi đây Phải tự đứng lên mà thôi Che nhẹ đi những niềm đau và nỗi buồn Xung quanh anh giờ đây cô đơn mình anh ôm giấc mơ Nhìn em bước ra đi xa dần (eh) Nhìn em bước ra đi xa dần (eh) Nhìn em nhìn em bước đi huh (eh) Nhìn em bước ra đi xa (eh) Nắng ấm xa dần rồi Nắng ấm xa dần rồi Nắng ấm xa dần bỏ rơi để lại những giấc mơ Giữ lại đi giữ giữ lại đi Nắng ấm xa dần rồi Nắng ấm xa dần rồi Nắng ấm xa dần xa dần theo những tiếng cười Hãy mang đi giúp những nỗi buồn"
  };

  ngOnInit(): void {
    this.fetchTrackData();
    this.audioPlayer.nativeElement.volume = this.volume / 100;

    this.sharedService.sharedData$.subscribe((data) => {
      this.sharedData = data;
      if (this.sharedData.length === 0) {
        console.log('Không có dữ liệu trong sharedData');
      }
    });
  }

  fetchTrackData(): void {
    this.setTrackData(this.data);
  }

  setTrackData(data: any, autoPlay: boolean = false): void {
    this.currentTrack = {
      name: data.title,
      artist: data.artists[0]?.name || 'Unknown Artist',
      image_location: data.image_location || 'default-album-art.jpg',
      url: data.file_location,
      duration: data.duration,
      lyrics: data.lyrics
    };

    this.duration = data.duration * 60;
    if (this.audioPlayer?.nativeElement) {
      this.audioPlayer.nativeElement.src = this.currentTrack.url;
      this.audioPlayer.nativeElement.load();
      this.currentTime = 0;
      this.progress = 0;

      if (autoPlay) {
        this.isPlaying = true;
        // Đợi âm thanh sẵn sàng trước khi phát
        const playAudio = () => {
          this.audioPlayer.nativeElement.play().then(() => {
            console.log('Phát nhạc thành công:', this.currentTrack.name);
          }).catch(err => {
            console.error('Lỗi phát nhạc:', err);
            this.isPlaying = false;
          });
        };

        // Kiểm tra nếu âm thanh đã sẵn sàng
        if (this.audioPlayer.nativeElement.readyState >= 2) {
          playAudio();
        } else {
          this.audioPlayer.nativeElement.oncanplay = playAudio;
        }
      }
    }
  }

  togglePlay(): void {
    if (!this.currentTrack) return;

    const audio = this.audioPlayer.nativeElement;
    if (this.isPlaying) {
      audio.pause();
      this.isPlaying = false;
    } else {
      audio.play().then(() => {
        console.log('Phát nhạc từ togglePlay');
      }).catch(err => {
        console.error('Lỗi phát nhạc:', err);
      });
      this.isPlaying = true;
    }
  }

  previousTrack(): void {
    if (!this.sharedData.length) return;

    const currentIndex = this.sharedData.findIndex(track => track.title === this.currentTrack?.name);
    const newTrack = currentIndex > 0 
      ? this.sharedData[currentIndex - 1]
      : this.sharedData[this.sharedData.length - 1];

    this.setTrackData(newTrack, this.isPlaying);
  }

  nextTrack(): void {
    if (!this.sharedData.length) return;

    const currentIndex = this.sharedData.findIndex(track => track.title === this.currentTrack?.name);
    const newTrack = currentIndex < this.sharedData.length - 1 
      ? this.sharedData[currentIndex + 1]
      : this.sharedData[0];

    this.setTrackData(newTrack, this.isPlaying);
  }

  onTrackEnded(): void {
    this.nextTrack();
  }

  updateProgress(event: Event): void {
    const audio = event.target as HTMLAudioElement;
    this.currentTime = audio.currentTime;
    this.duration = audio.duration || this.duration;
    this.progress = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
  }

  onLoadedMetadata(): void {
    this.duration = this.audioPlayer.nativeElement.duration;
  }

  seekTo(event: MouseEvent): void {
    if (!this.audioPlayer || !this.duration) return;

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width;
    const newTime = position * this.duration;

    this.audioPlayer.nativeElement.currentTime = newTime;
    this.currentTime = newTime;
    this.progress = position * 100;
  }

  toggleMute(): void {
    if (!this.audioPlayer) return;

    this.isMuted = !this.isMuted;
    this.audioPlayer.nativeElement.muted = this.isMuted;
    if (this.isMuted) {
      this.volume = 0;
    } else {
      this.volume = this.audioPlayer.nativeElement.volume * 100 || 50;
    }
  }

  adjustVolume(event: MouseEvent): void {
    if (!this.audioPlayer) return;

    const element = event.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));

    this.volume = position * 100;
    this.audioPlayer.nativeElement.volume = position;
    this.isMuted = this.volume === 0;
    this.audioPlayer.nativeElement.muted = this.isMuted;
  }

  toggleLyrics(): void {
    this.showLyrics = !this.showLyrics;
  }

  goToVideo(name: any, image: any, artist: any, link: any): void {
    this.router.navigate(['/video'], {
      queryParams: { name, image, artist, link }
    });
  }
}