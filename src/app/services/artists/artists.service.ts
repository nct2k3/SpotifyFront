import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import {
  ApiResponseArtist,
  Artist,
  ArtistResponse,
} from 'src/app/Models/artists.model';

@Injectable({
  providedIn: 'root',
})
export class ArtistsService {
  private apiUrl = 'http://127.0.0.1:8000/api/artists/';

  constructor(private http: HttpClient) {}

  getArtists(): Observable<ArtistResponse[]> {
    return this.http.get<ApiResponseArtist>(this.apiUrl).pipe(
      map((response) => response.results) // Trả về mảng các nghệ sĩ từ trường results
    );
  }

  // Tạo mới một nghệ sĩ
  createArtist(artistData: any): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http.post<any>(this.apiUrl, artistData, {headers}); // Gửi dữ liệu nghệ sĩ mới lên server
  }

  // Cập nhật thông tin nghệ sĩ
  updateArtist(artistId: string, artistData: any): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http.put<any>(`${this.apiUrl}${artistId}/`, artistData, {headers}); // Cập nhật thông tin nghệ sĩ
  }

  // Xóa một nghệ sĩ theo ID
  deleteArtist(artistId: string): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http.delete<any>(`${this.apiUrl}${artistId}/`, {headers}); // Xóa nghệ sĩ theo ID
  }
}
