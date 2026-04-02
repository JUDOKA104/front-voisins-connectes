import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminStats, AdminUser, Annonce, BanResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`);
  }

  deleteAnnonce(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/annonces/${id}`);
  }

  banUser(id: number | string, motif?: string): Observable<BanResponse> {
    return this.http.patch<BanResponse>(`${this.apiUrl}/admin/users/${id}/ban`, { motif });
  }

  getBannedUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/admin/users/banned`);
  }

  searchUsers(query: string): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/admin/users/search?q=${query}`);
  }

  getUserAnnonces(userId: number | string): Observable<Annonce[]> {
    return this.http.get<Annonce[]>(`${this.apiUrl}/admin/users/${userId}/annonces`);
  }
}