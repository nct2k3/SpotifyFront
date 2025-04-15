import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private apiUrl = 'http://127.0.0.1:8000/api/albums/';

  constructor(private http: HttpClient) {}

  // Lấy danh sách album
  getAlbum(): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });

    return this.http.get<any>(this.apiUrl, { headers }).pipe(
      tap((data) => console.log('Albums data:', data.results)),
      map((data) => data.results)
    );
  }

  // Lấy một album cụ thể theo ID (tùy chọn)
  getAlbumByid(id: string): Observable<any> {
    const url = `${this.apiUrl}${id}/`;
    return this.http
      .get<any>(url)
      .pipe(tap((data) => console.log('Album data:', data)));
  }

  deleteAlbum(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Debug: Log the token

    if (!token) {
      console.error('No token found in localStorage');
      throw new Error('Authentication token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`, // Adjust to `Bearer ${token}` if your API expects Bearer
      'Content-Type': 'application/json',
    });

    return this.http.delete(`${this.apiUrl}${id}/`, { headers });
  }

  createAlbum(album: {
    title: string;
    artist_ids: string[];
    song_ids: string[];
    release_date: string;
  }): Observable<any> {
    const token = localStorage.getItem('token');
    console.log('Token:', token); // Debug: Log the token

    if (!token) {
      console.error('No token found in localStorage');
      throw new Error('Authentication token is missing');
    }

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`, // Adjust to `Bearer ${token}` if your API expects Bearer
      'Content-Type': 'application/json',
    });

    console.log('Request payload:', album); // Debug: Log the payload
    console.log('Request headers:', headers); // Debug: Log the headers

    return this.http.post<any>(this.apiUrl, album, { headers });
  }

  updateAlbum(id: string, albumData: any): Observable<any> {
    const token = localStorage.getItem('token'); // hoặc lấy từ AuthService nếu bạn có

    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(`${this.apiUrl}${id}/`, albumData, { headers });
  }
}
