import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';

interface RegisterPayload {
  nombre?: string;
  username?: string;
  email: string;
  password?: string;
  clave?: string;
  telefono?: string;
  direccion?: string;
  avatar?: string;
  idrol?: number;
}

interface LoginPayload {
  email: string;
  password?: string;
  clave?: string;
}

interface UpdateProfilePayload {
  nombre?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_HOST = `${window.location.protocol}//${window.location.hostname}:4800`;
  private readonly base = `${this.API_HOST}/api/auth`;

  private userSubject = new BehaviorSubject<any>(this.loadUser());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = this.getToken();
    if (token && !this.userSubject.value) {
      this.getProfile().subscribe({ next: () => {}, error: () => {} });
    }
  }

  register(payload: RegisterPayload): Observable<any> {
    const body = {
      nombre: payload.nombre || payload.username,
      email: payload.email,
      clave: payload.clave || payload.password,
      telefono: payload.telefono || null,
      direccion: payload.direccion || null,
      avatar: payload.avatar || null,
      idrol: payload.idrol || 1,
    };

    return this.http.post(`${this.base}/register`, body);
  }

  login(payload: LoginPayload): Observable<any> {
    const body = {
      email: payload.email,
      clave: payload.clave || payload.password,
    };

    return this.http.post(`${this.base}/login`, body).pipe(
      tap((res: any) => this.persistSession(res))
    );
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post(`${this.API_HOST}/api/upload`, formData);
  }

  updateAvatarUrl(avatarUrl: string) {
    const user = this.currentUserValue;
    if (!user) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    return this.updateUsuario(user.idusuario || user.id, { avatar: avatarUrl });
  }

  getProfile() {
    const cfg = this.withAuth();
    if (!cfg) {
      return throwError(() => new Error('No hay sesión activa'));
    }

    return this.http.get(`${this.base}/profile`, cfg).pipe(
      tap((res: any) => {
        if (res?.usuario) {
          this.persistUser(this.normalizeUser(res.usuario));
        }
      })
    );
  }

  updateProfile(payload: UpdateProfilePayload) {
    const user = this.currentUserValue;
    if (!user) {
      return throwError(() => new Error('No hay usuario autenticado'));
    }

    return this.updateUsuario(user.idusuario || user.id, payload);
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  isLogged() {
    return !!this.getToken();
  }

  get currentUserValue() {
    return this.userSubject.value;
  }

  private persistSession(res: any) {
    if (res && res.accessToken) {
      localStorage.setItem('accessToken', res.accessToken);
      const user = this.normalizeUser(res.usuario || res.user);
      if (user) {
        this.persistUser(user);
      }
    }
  }

  private updateUsuario(id: number, payload: UpdateProfilePayload) {
    const cfg = this.withAuth();
    if (!cfg) {
      return throwError(() => new Error('No hay sesión activa'));
    }

    return this.http.put(`${this.API_HOST}/api/usuarios/${id}`, payload, cfg).pipe(
      tap((res: any) => {
        if (res?.usuario) {
          this.persistUser(this.normalizeUser(res.usuario));
        }
      })
    );
  }

  private withAuth() {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  private persistUser(user: any) {
    if (!user) return;
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSubject.next(user);
  }

  private normalizeUser(user: any) {
    if (!user) return null;
    if (user.idusuario) return user;
    if (user.id) {
      return {
        idusuario: user.id,
        nombre: user.nombre || user.username,
        email: user.email,
        avatar: user.avatar,
        telefono: user.telefono || null,
        direccion: user.direccion || null,
        rol: user.rol || null,
      };
    }
    return user;
  }

  private loadUser() {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }
}
