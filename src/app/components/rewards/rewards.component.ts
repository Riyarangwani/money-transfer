import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RewardService } from '../../services/reward.service';
import { RewardSummary } from '../../models/models';

@Component({
    selector: 'app-rewards',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './rewards.component.html',
    styleUrls: ['./rewards.component.css']
})
export class RewardsComponent implements OnInit {
    rewardSummary: RewardSummary | null = null;
    isLoading = true;
    errorMessage = '';

    constructor(
        private authService: AuthService,
        private rewardService: RewardService
    ) { }

    ngOnInit(): void {
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
}

