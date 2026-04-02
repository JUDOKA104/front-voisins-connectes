import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginCredentials, LoginResponse, User } from '../models';

interface JwtPayload {
  username: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login_check`, credentials).pipe(
      tap((res) => {
        if (res.token) {
          this.saveSession(res.token);
        }
      }),
    );
  }

  register(userData: FormData): Observable<User>;
  register(userData: Record<string, unknown>): Observable<User>;
  register(userData: FormData | Record<string, unknown>): Observable<User> {
    if (userData instanceof FormData) {
      return this.http.post<User>(`${this.apiUrl}/register`, userData);
    }

    const payload = {
      ...userData,
      roles: ['ROLE_USER'],
    };
    return this.http.post<User>(`${this.apiUrl}/register`, payload);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  updateProfile(data: FormData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/me`, data);
  }

  get currentUser(): JwtPayload | null {
    const token = this.getCookie('jwt_token');
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodedInfo: JwtPayload = JSON.parse(atob(payload));
      return { email: decodedInfo.username, roles: decodedInfo.roles } as JwtPayload & {
        email: string;
      };
    } catch {
      return null;
    }
  }

  saveSession(token: string): void {
    this.setCookie('jwt_token', token, 1);
  }

  logout(): void {
    this.deleteCookie('jwt_token');
  }

  private setCookie(name: string, value: string, days: number = 7): void {
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

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}