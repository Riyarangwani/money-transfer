import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/models';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username = '';
    password = '';
    errorMessage = '';
    isLoading = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    async login(): Promise<void> {
        if (!this.username || !this.password) {
            this.errorMessage = 'Please enter both username and password';
            return;
        }

        if (!this.validatePassword(this.password)) {
            this.errorMessage = 'Password must be at least 8 characters long, alphanumeric, and contain at least one special character';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const hashedPassword = await this.sha256(this.password);

        const request: LoginRequest = {
            username: this.username,
            password: hashedPassword
        };

        this.authService.login(request).subscribe({
            next: (account) => {
                this.isLoading = false;
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Invalid username or password';
            }
        });
    }

    private validatePassword(password: string): boolean {
        const hasMinLength = password.length >= 8;
        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\\/]/.test(password);
        return hasMinLength && hasLetter && hasNumber && hasSpecialChar;
    }

    private async sha256(message: string): Promise<string> {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}
