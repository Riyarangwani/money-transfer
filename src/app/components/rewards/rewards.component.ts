import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RewardService } from '../../services/reward.service';
import { RewardRedemptionResponse, RewardSummary } from '../../models/models';

@Component({
    selector: 'app-rewards',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './rewards.component.html',
    styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {
    rewardSummary: RewardSummary | null = null;
    redeemPoints = 0;
    isLoading = true;
    redeeming = false;
    redemptionMessage = '';
    validationMessage = '';
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private rewardService: RewardService
    ) { }

    ngOnInit(): void {
        this.loadRewards();
    }

    loadRewards(): void {
        const account = this.authService.getCurrentAccount();
        if (account) {
            this.rewardService.getRewardSummary(account.id).subscribe({
                next: (summary) => {
                    this.rewardSummary = summary;
                    this.isLoading = false;
                },
                error: () => {
                    this.errorMessage = 'Failed to load reward data';
                    this.isLoading = false;
                }
            });
        }
    }

    get maxRedeemPoints(): number {
        return this.rewardSummary?.totalPoints ?? 0;
    }

    get selectedRedeemValue(): number {
        return Number.isFinite(this.redeemPoints) ? Math.max(0, Math.trunc(this.redeemPoints)) : 0;
    }

    get availableRedeemValue(): number {
        return this.rewardSummary ? this.rewardSummary.totalPoints : 0;
    }

    onRedeemPointsChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = Number(input.value);
        this.redeemPoints = Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0;
        this.validationMessage = '';
        this.redemptionMessage = '';
        this.errorMessage = '';
    }

    redeemRewards(): void {
        const account = this.authService.getCurrentAccount();
        if (!account || !this.rewardSummary) {
            return;
        }

        const requestedPoints = this.selectedRedeemValue;
        this.validationMessage = '';
        this.errorMessage = '';
        this.redemptionMessage = '';

        if (requestedPoints <= 0) {
            this.validationMessage = 'Enter a positive reward point amount to redeem.';
            return;
        }

        if (requestedPoints > this.rewardSummary.totalPoints) {
            this.validationMessage = `You only have ${this.rewardSummary.totalPoints} points available.`;
            return;
        }

        this.redeeming = true;

        this.rewardService.redeemRewards(account.id, requestedPoints).subscribe({
            next: (response: RewardRedemptionResponse) => {
                this.redemptionMessage = `Successfully redeemed ${requestedPoints} points for ₹${response.redeemedAmount.toFixed(2)}.`;
                this.rewardSummary = {
                    ...this.rewardSummary!,
                    totalPoints: response.remainingPoints,
                    history: [
                        {
                            id: Date.now(),
                            transactionId: `REWARD-REDEEM-${Date.now()}`,
                            pointsEarned: -requestedPoints,
                            createdOn: new Date().toISOString()
                        },
                        ...this.rewardSummary!.history
                    ]
                };
                this.authService.setCurrentAccount({
                    ...account,
                    balance: response.newBalance
                });
                this.redeemPoints = 0;
                this.redeeming = false;
            },
            error: (error) => {
                const message = error?.error?.message || 'Unable to redeem reward points. Please try again later.';
                this.errorMessage = message;
                console.error('Redeem failed:', error);
                this.redeeming = false;
            }
        });
    }
}

