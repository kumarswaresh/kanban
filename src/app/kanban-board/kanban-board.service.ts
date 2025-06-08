import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KanbanBoardService {
  constructor(private http: HttpClient) {}

  getRequests(): Observable<any[]> {
    // Replace with your API endpoint
    return this.http.get<any[]>('/api/requests');
  }

  updateRequestStatus(requestId: string, status: string): Observable<any> {
    // Replace with your API endpoint
    return this.http.patch(`/api/requests/${requestId}`, { status });
  }

  getRequestDetail(requestId: string): Observable<any> {
    // Replace with your API endpoint
    return this.http.get(`/api/requests/${requestId}`);
  }
}
