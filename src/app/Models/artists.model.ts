export interface ApiResponseArtist {
  count: null,
  next: null,
  previous: null,
  results: Artist[]; // Mảng các nghệ sĩ
}
export interface Artist {
    artist_id: number;
    name: string;
    bio: string;
    debut_year: number;
  }
  