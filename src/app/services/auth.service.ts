import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, Account } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/v1';
    private currentAccountSubject = new BehaviorSubject<Account | null>(null);
    public currentAccount$ = this.currentAccountSubject.asObservable();

    constructor(private http: HttpClient) {
        const savedAccount = localStorage.getItem('currentAccount');
        if (savedAccount) {
            this.currentAccountSubject.next(JSON.parse(savedAccount));
        }
    }

    login(request: LoginRequest): Observable<Account> {
        return this.http.post<Account>(`${this.apiUrl}/accounts/login`, request).pipe(
            tap(account => {
                localStorage.setItem('currentAccount', JSON.stringify(account));
                localStorage.setItem('credentials', btoa(`${request.username}:${request.password}`));
                this.currentAccountSubject.next(account);
            })
        );
    }

    setCurrentAccount(account: Account): void {
        localStorage.setItem('currentAccount', JSON.stringify(account));
        this.currentAccountSubject.next(account);
    }

    logout(): void {
        localStorage.removeItem('currentAccount');
        localStorage.removeItem('credentials');
        this.currentAccountSubject.next(null);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('currentAccount');
    }

    getCredentials(): string | null {
        return localStorage.getItem('credentials');
    }

    getCurrentAccount(): Account | null {
        const saved = localStorage.getItem('currentAccount');
        return saved ? JSON.parse(saved) : null;
    }
}
