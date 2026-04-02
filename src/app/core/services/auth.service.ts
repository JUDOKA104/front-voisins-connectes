import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getAnnonces(categorieId?: number): Observable<any[]> {
    let url = `${this.apiUrl}/annonces`;
    if (categorieId) {
      url += `?categorie=${categorieId}`;
    }
    return this.http.get<any[]>(url);
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categories`);
  }

  getAnnonceById(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/annonces/${id}`);
  }

  // Crée une annonce
  createAnnonce(annonceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/annonces`, annonceData);
  }

  updateAnnonceStatut(id: number, statut: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/annonces/${id}/statut`, { statut });
  }

  updateAnnonce(id: number | string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/annonces/${id}`, data);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/me`, data);
  }

  deleteAnnonce(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/annonces/${id}`);
  }

  aiderAnnonce(id: number | string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/annonces/${id}/aider`, {});
  }

  desisterAnnonce(id: number | string, motif: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/annonces/${id}/desister`, { motif });
  }

  addComment(annonceId: number | string, contenu: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/annonces/${annonceId}/commentaires`, { contenu });
  }

  // --- LE VRAI LOGIN ---
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login_check`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          this.saveSession(res.token);
        }
      }),
    );
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }

  adminDeleteAnnonce(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/annonces/${id}`);
  }

  adminBanUser(id: number | string, motif?: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/users/${id}/ban`, { motif });
  }

  adminGetBannedUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users/banned`);
  }

  adminSearchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users/search?q=${query}`);
  }

  adminGetUserAnnonces(userId: number | string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users/${userId}/annonces`);
  }

  // --- LE VRAI REGISTER ---
  register(userData: any): Observable<any> {
    if (userData instanceof FormData) {
      return this.http.post(`${this.apiUrl}/register`, userData);
    }

    const payload = {
      ...userData,
      roles: ['ROLE_USER'],
    };
    return this.http.post(`${this.apiUrl}/register`, payload);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  get currentUser(): any | null {
    const token = this.getCookie('jwt_token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodedInfo = JSON.parse(atob(payload));
      return { email: decodedInfo.username, roles: decodedInfo.roles };
    } catch (e) {
      return null;
    }
  }

  private setCookie(name: string, value: string, days: number = 7) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private deleteCookie(name: string) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  saveSession(token: string) {
    this.setCookie('jwt_token', token, 1); // Expire dans 1 jour
  }

  logout() {
    this.deleteCookie('jwt_token');
  }
}
