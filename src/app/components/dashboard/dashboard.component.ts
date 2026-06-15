import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AccountService } from '../../services/account.service';
import { RewardService } from '../../services/reward.service';        // ← NEW
import { Account } from '../../models/models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    account: Account | null = null;
    balance: number = 0;
    totalRewardPoints: number = 0;                                     // ← NEW
    isLoading = true;

    constructor(
        private authService: AuthService,
        private accountService: AccountService,
        private rewardService: RewardService,                          // ← NEW
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadAccountData();
    }

    loadAccountData(): void {
        this.account = this.authService.getCurrentAccount();
        if (this.account) {
            const accountId = this.account.id;

            this.accountService.getBalance(accountId).subscribe({
                next: (data) => {
                    this.balance = data.balance;
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading balance:', error);
                    this.isLoading = false;
                }
            });

            // ── NEW: load reward points ──────────────────────────────────────
            this.rewardService.getRewardSummary(accountId).subscribe({
                next: (summary) => {
                    this.totalRewardPoints = summary.totalPoints;
                },
                error: () => {
                    // Non-critical — dashboard still works without points
                    this.totalRewardPoints = 0;
                }
            });
            // ────────────────────────────────────────────────────────────────
        }
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
