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
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
      this.years.push(year);
    }
  }

  artists: ArtistResponse[] = [];
  filteredArtistsList: any[] = [];
  searchTerm = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  currentArtist: any = {
    name: '',
    debut_year: '',
    bio: '',
    artist_photo: null,
  };
  previewImage: string = '';
  selectedArtist: any = null;
  years: number[] = [];

  ngOnInit() {
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
    this.currentArtist = { name: '', debut_year: '', bio: '', artist_photo: null };
    this.previewImage = '';
    this.isModalOpen = true;
  }

  openEditModal(artistId: string, artist: any): void {
    this.isEditMode = true;
    this.currentArtist = { ...artist, artist_photo: null };
    this.previewImage = artist.artist_photo;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.isEditMode = false;
    this.currentArtist = { name: '', debut_year: '', bio: '', artist_photo: null };
    this.previewImage = '';
  }

  private logFormData(formData: FormData): void {
    console.log('FormData contents:');
    formData.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`${key}: File(name=${value.name}, type=${value.type}, size=${value.size})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    });
  }

  saveArtist(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    if (!this.isEditMode && !this.currentArtist.artist_photo) {
      this.toast.showMessage('Please select an artist photo!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', this.currentArtist.name);
    formData.append('debut_year', this.currentArtist.debut_year.toString());
    formData.append('bio', this.currentArtist.bio);
    if (this.currentArtist.artist_photo instanceof File) {
      formData.append('artist_photo_url', this.currentArtist.artist_photo);
      console.log('Appending file:', this.currentArtist.artist_photo.name);
    } else {
      console.warn('artist_photo is not a File:', this.currentArtist.artist_photo);
    }

    this.logFormData(formData);

    if (this.isEditMode) {
      this.updateArtist(formData);
    } else {
      this.createArtist(formData);
    }
  }

  createArtist(formData: FormData): void {
    this.artistService.createArtist(formData).subscribe({
      next: (res) => {
        console.log('Create artist response:', res);
        this.artists.push(res);
        this.filteredArtistsList = this.artists;
        this.closeModal();
        this.toast.showMessage('Create successful artists!', 'success');
      },
      error: (err) => {
        console.error('Error creating artist:', err);
        this.toast.showMessage(
          `Create failed: ${err.error?.artist_photo || 'Unknown error'}`,
          'error'
        );
      },
    });
  }

  updateArtist(formData: FormData): void {
    if (!this.currentArtist?.id) {
      this.toast.showMessage('Artist ID is missing!', 'error');
      return;
    }

    this.artistService.updateArtist(this.currentArtist.id, formData).subscribe({
      next: (res) => {
        console.log('Update artist response:', res);
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
        this.toast.showMessage(
          `Update failed: ${err.error?.artist_photo || 'Unknown error'}`,
          'error'
        );
      },
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.currentArtist.artist_photo = file;
        console.log('Selected file:', {
          name: file.name,
          type: file.type,
          size: file.size,
        });

        const reader = new FileReader();
        reader.onload = () => {
          this.previewImage = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        console.error('Invalid file type. Please select an image.');
        this.toast.showMessage('Please select a valid image file!', 'error');
        input.value = '';
        this.currentArtist.artist_photo = null;
        this.previewImage = '';
      }
    } else {
      this.currentArtist.artist_photo = null;
      this.previewImage = '';
    }
  }
}