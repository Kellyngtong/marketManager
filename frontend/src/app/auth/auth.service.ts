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
    console.log('🔧 AuthService constructor - Inicializando...');
    const token = this.getToken();
    console.log('🔧 AuthService constructor - Token al iniciar:', token ? 'EXISTE' : 'NO EXISTE');
    
    // Monitor localStorage changes
    window.addEventListener('storage', (event) => {
      if (event.key === 'accessToken') {
        console.log('⚠️ localStorage "accessToken" cambió externamente:', event.newValue ? 'EXISTE' : 'ELIMINADO');
      }
    });
    
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

    console.log('🔐 AuthService.login() - Intentando login con email:', payload.email);
    return this.http.post(`${this.base}/login`, body).pipe(
      tap((res: any) => {
        console.log('✅ Login exitoso - Response:', res);
        this.persistSession(res);
      })
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
    const cfg = this.withAuth();
    if (!cfg) {
      return throwError(() => new Error('No hay sesión activa'));
    }

    return this.http.put(`${this.base}/profile`, payload, cfg).pipe(
      tap((res: any) => {
        if (res?.usuario) {
          const merged = {
            ...this.currentUserValue,
            ...this.normalizeUser(res.usuario),
            ...payload,
          };
          this.persistUser(merged);
          return;
        }

        if (this.currentUserValue) {
          this.persistUser({
            ...this.currentUserValue,
            ...payload,
          });
        }
      })
    );
  }

  updateLocalUser(patch: any) {
    const current = this.currentUserValue;
    if (!current) return;
    this.persistUser({
      ...current,
      ...patch,
    });
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
  }

  getToken() {
    const token = localStorage.getItem('accessToken');
    console.log('🔑 getToken() - Token recuperado:', token ? token.substring(0, 20) + '...' : 'NO EXISTE');
    return token;
  }

  isLogged() {
    const logged = !!this.getToken();
    console.log('📊 isLogged():', logged);
    return logged;
  }

  get currentUserValue() {
    return this.userSubject.value;
  }

  private persistSession(res: any) {
    console.log('💾 persistSession() LLAMADO - Response:', res);
    
    if (res && res.accessToken) {
      console.log('💾 persistSession() - accessToken recibido:', res.accessToken.substring(0, 20) + '...');
      console.log('💾 persistSession() - localStorage antes:', localStorage.getItem('accessToken') ? 'EXISTE' : 'VACÍO');
      
      localStorage.setItem('accessToken', res.accessToken);
      console.log('💾 persistSession() - Token guardado ✅');
      console.log('💾 persistSession() - localStorage después:', localStorage.getItem('accessToken') ? 'EXISTE' : 'VACÍO');
      
      const user = this.normalizeUser(res.usuario || res.user);
      if (user) {
        console.log('💾 persistSession() - Guardando usuario:', user.idusuario, user.email);
        this.persistUser(user);
      }
    } else {
      console.error('❌ persistSession() - No hay accessToken en la respuesta:', res);
      console.error('❌ Propiedades de res:', Object.keys(res || {}));
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
    if (!user) {
      console.error('❌ persistUser() - Usuario es null/undefined');
      return;
    }
    console.log('💾 persistUser() - Guardando usuario en localStorage:', user.idusuario);
    localStorage.setItem('currentUser', JSON.stringify(user));
    console.log('💾 persistUser() - Verificando guardado:', localStorage.getItem('currentUser') ? 'OK' : 'FALLO');
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
