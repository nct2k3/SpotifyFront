import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResponseArtist, ArtistResponse } from 'src/app/Models/artists.model';

@Injectable({
  providedIn: 'root',
})
export class ArtistsService {
  private apiUrl = 'http://127.0.0.1:8000/api/artists/';

  constructor(private http: HttpClient) {}

  getArtists(): Observable<ArtistResponse[]> {
    return this.http.get<ApiResponseArtist>(this.apiUrl).pipe(
      map((response) => response.results)
    );
  }

  getArtistById(id: string): Observable<ArtistResponse> {
    return this.http.get<ApiResponseArtist>(this.apiUrl).pipe(
      map(response => {
        const artist = response.results.find(artist => artist.id === id);
        if (!artist) {
          throw new Error('Artist not found');
        }
        return artist;
      })
    );
  }

  createArtist(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http.post<any>(this.apiUrl, formData, { headers });
  }

  updateArtist(artistId: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http.put<any>(`${this.apiUrl}${artistId}/`, formData, { headers });
  }

  deleteArtist(artistId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http.delete<any>(`${this.apiUrl}${artistId}/`, { headers });
  }
}