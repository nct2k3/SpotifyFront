export interface ApiResponseArtist {
  count: null;
  next: null;
  previous: null;
  results: ArtistResponse[]; // Mảng các nghệ sĩ
}
export interface Artist {
  artist_id: number;
  name: string;
  bio: string;
  debut_year: number;
}

export interface ArtistResponse {
  id: string;
  name: string;
  bio: string;
  artist_photo: string;
  debut_year: number;
}