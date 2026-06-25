import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { CreateAccountRequest } from '../../models/models';

@Component({
    selector: 'app-create-account',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './create-account.component.html',
    styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent {
    username = '';
    password = '';
    holderName = '';
    initialBalance = 1000;
    errorMessage = '';
    successMessage = '';
    isLoading = false;

    constructor(
        private accountService: AccountService,
        private router: Router
    ) { }

    async createAccount(): Promise<void> {
        if (!this.username || !this.password || !this.holderName) {
            this.errorMessage = 'Please fill in all required fields';
            return;
        }

        if (!this.validatePassword(this.password)) {
            this.errorMessage = 'Password must be at least 8 characters long, alphanumeric, and contain at least one special character';
            return;
        }

        if (this.initialBalance < 0) {
            this.errorMessage = 'Initial balance must be positive';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const hashedPassword = await this.sha256(this.password);

        const request: CreateAccountRequest = {
            username: this.username,
            password: hashedPassword,
            holderName: this.holderName,
            initialBalance: this.initialBalance
        };

        this.accountService.createAccount(request).subscribe({
            next: (account) => {
                this.isLoading = false;
                this.successMessage = `Account created successfully! Your Account ID is ${account.id}`;
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            },
            error: (error) => {
                this.isLoading = false;
                this.errorMessage = error.error?.message || 'Failed to create account. Username might already exist.';
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
