import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/app/environment.prod';


@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private apiUrl =  `${environment.apiUrl}/api/albums/`;

  constructor(private http: HttpClient) {}

  getAlbum(): Observable<any> {
  
    return this.http.get<any>(this.apiUrl).pipe(
  
      map((data) => data.results)
    );
  }

  getAlbumByid(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });
    const url = `${this.apiUrl}${id}/`;
    return this.http.get<any>(url, { headers }).pipe(
      tap((data) => console.log('Album data:', data))
    );
  }

  deleteAlbum(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });
    return this.http.delete(`${this.apiUrl}${id}/`, { headers });
  }

  createAlbum(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });
    return this.http.post<any>(this.apiUrl, formData, { headers });
  }

  updateAlbum(id: string, formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    const headers = new HttpHeaders({
      Authorization: `Token ${token}`,
    });
    return this.http.put(`${this.apiUrl}${id}/`, formData, { headers });
  }
}