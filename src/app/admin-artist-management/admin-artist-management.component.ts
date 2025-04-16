import { Component, ViewChild } from '@angular/core';
import { ArtistsService } from '../services/artists/artists.service';
import { ArtistResponse } from '../Models/artists.model';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-admin-artist-management',
  templateUrl: './admin-artist-management.component.html',
  styleUrls: ['./admin-artist-management.component.css'],
})
export class AdminArtistManagementComponent {
  @ViewChild('toast') toast!: ToastMessageComponent;

  constructor(private artistService: ArtistsService) {
    // Generate years from 1900 to current year (2025)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }

  artists: ArtistResponse[] = [];
  filteredArtistsList: any[] = [];
  searchTerm = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false; // Flag to determine create or edit mode
  currentArtist: any = {
    name: '',
    debut_year: '',
    bio: '',
    artist_photo: ''
  };
  previewImage: string = '';
  selectedArtist: any = null;
  years: number[] = []; // List of years for dropdown

  ngOnInit() {
    // Gọi API để lấy danh sách nghệ sĩ
    this.loadArtists();
  }

  loadArtists(): void {
    this.artistService.getArtists().subscribe({
      next: (res) => {
        this.artists = res;
        this.filteredArtistsList = res;
      },
      error: (err) => console.error('Error loading artists:', err),
    });
  }

  filteredArtists(): any[] {
    if (!this.searchTerm) return this.artists;
    return this.artists.filter((artist) =>
      artist.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentArtist = { name: '', debut_year: '', bio: '', artist_photo: '' };
    this.isModalOpen = true;
  }

  openEditModal(artistId: string, artist: any): void {
    this.isEditMode = true;
    this.currentArtist = { ...artist };
    this.previewImage = artist.artist_photo;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.currentArtist = { name: '', debut_year: '', bio: '', artist_photo: '' };
  }

  saveArtist(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched(); // Kích hoạt để hiển thị lỗi
      });
      return;
    }

    if (this.isEditMode ) {
      this.updateArtist();
      this.isEditMode = false;
    } else {
      this.createArtist();
    }
  }

  createArtist(): void {
    console.log(this.currentArtist)
    this.artistService.createArtist(this.currentArtist).subscribe({
      next: (res) => {
        this.artists.push(res);
        this.filteredArtistsList = this.artists;
        this.closeModal();
        this.toast.showMessage('Create successful artists!', 'success');
      },
      error: (err) => {
        console.error('Error creating artist:', err);
        this.toast.showMessage('Create failed artists!', 'error');
      }
    });
  }

  updateArtist(): void {
    if (!this.currentArtist?.id) {
      alert('Artist ID is missing!');
      return;
    }
  
    this.artistService.updateArtist(this.currentArtist.id, this.currentArtist).subscribe({
      next: (res) => {
        const index = this.artists.findIndex(a => a.id === this.currentArtist.id);
        if (index !== -1) {
          this.artists[index] = res;
          this.filteredArtistsList = [...this.artists];
        }
        this.closeModal();
        this.toast.showMessage('Update successful artists!', 'success');
      },
      error: (err) => {
        console.error('Error updating artist:', err);
        this.toast.showMessage('Update failed artists!', 'error');
      }
    });
  }
  

  deleteArtist(artistId: string): void {
    if (confirm('Are you sure you want to delete this artist?')) {
      this.artistService.deleteArtist(artistId).subscribe({
        next: () => {
          this.artists = this.artists.filter(a => a.id !== artistId);
          this.filteredArtistsList = this.artists;
          this.toast.showMessage('Delete successful artists!', 'success');
        },
        error: (err) => {
          console.error('Error deleting artist:', err);
          
        this.toast.showMessage('Delete failed artists!', 'error');
        },
      });
    }
  }

  // Handle file input for artist photo (create modal)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Define the subdirectory structure under assets
      const subDirectory = 'Img/ImgArt'; // e.g., assets/images/artists
      const fileName = file.name;
      // Construct the relative path with subdirectories
      const relativePath = `../../assets/${subDirectory}/${fileName}`;
      this.currentArtist.artist_photo = relativePath;

      // For preview purposes, read the file as a base64 string
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string; // Store base64 for preview
      };
      reader.readAsDataURL(file);
    }
  }
}
