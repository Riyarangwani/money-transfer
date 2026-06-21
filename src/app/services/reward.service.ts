import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RewardRedemptionRequest, RewardRedemptionResponse, RewardSummary } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class RewardService {
    private apiUrl = 'http://localhost:8080/api/v1/rewards';

    constructor(private http: HttpClient) { }

    getRewardSummary(accountId: number): Observable<RewardSummary> {
        return this.http.get<RewardSummary>(`${this.apiUrl}/${accountId}`);
    }

    redeemRewards(accountId: number, points: number): Observable<RewardRedemptionResponse> {
        const payload: RewardRedemptionRequest = { points };
        return this.http.post<RewardRedemptionResponse>(`${this.apiUrl}/${accountId}/redeem`, payload);
    }
}
