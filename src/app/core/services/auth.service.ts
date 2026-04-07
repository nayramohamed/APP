import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { IUserResponse } from '../models/auth/user-response.model';
import { StorageService } from './storage.service';
import { ISignupFormData } from '../models/auth/signup-form-data.model';
import { ILoginFormData } from '../models/auth/login-form-data..model';
import { IUser } from '../models/auth/user.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { IToken } from '../models/auth/token.model';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly cookieService: CookieService = inject(CookieService);
  private readonly storageService: StorageService = inject(StorageService);
  private readonly baseUrl = environment.baseUrl;
  private currentUserSubject = new BehaviorSubject<IUser | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();
  readonly user = toSignal(this.currentUser$, { initialValue: this.getStoredUser() });
  readonly isLoggedIn = computed(() => !!this.user());

  signUp(registerForm: ISignupFormData): Observable<IUserResponse> {
    return this.httpClient.post<IUserResponse>(`${this.baseUrl}/v1/auth/signup`, registerForm);
  }

  login(loginForm: ILoginFormData): Observable<IUserResponse> {
    return this.httpClient.post<IUserResponse>(`${this.baseUrl}/v1/auth/signin`, loginForm).pipe(
      tap((response: IUserResponse) => {
        const token = response?.token;
        this.cookieService.set('token', token);
        const decodedToken: IToken = jwtDecode<IToken>(token);
        const user: IUser = {
          ...response.user,
          _id: decodedToken.id,
        };
        this.setUser(user);
      }),
    );
  }

  logout(): void {
    this.cookieService.delete('token');
    this.storageService.removeItem('user');
    this.currentUserSubject.next(null);
  }

  updateUserData(newUserDataForm: any): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/v1/users/updateMe`, newUserDataForm);
  }

  updateUserPassword(newUserPasswordForm: any): Observable<any> {
    return this.httpClient.put<any>(
      `${this.baseUrl}/v1/users/changeMyPassword`,
      newUserPasswordForm,
    );
  }

  sendCode(email: string): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/v1/auth/forgotpasswords`, { email });
  }

  verifyCode(resetCode: string): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/v1/auth/verifyResetCode`, { resetCode });
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/v1/auth/resetpassword`, {
      email,
      newPassword,
    });
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getStoredUser(): IUser | null {
    const user = this.storageService.getItem('user');
    return user ? (JSON.parse(user) as IUser) : null;
  }
  getCurrentUser(): IUser {
    return this.currentUserSubject.value!;
  }
  setUser(user: IUser): void {
    this.storageService.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getToken(): string {
    const token = this.cookieService.get('token');
    if (this.isTokenExpired(token)) {
      this.logout();
      return '';
    }
    return token;
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp;

    return Math.floor(Date.now() / 1000) >= expiry;
  }
}
