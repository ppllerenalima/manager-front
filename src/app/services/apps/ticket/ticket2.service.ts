import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GetTicketRequest } from 'src/app/core/models/get-ticket-request.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Ticket2Service {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiManager}/Ticket`;

  constructor() {}

  // ✅ Ahora el método recibe un parámetro 'body'
  getActiveTicket(body: GetTicketRequest): Observable<any> {
    const url = `${this.baseUrl}/get-or-generate-active-ticket`;
    return this.http.post(url, body);
  }
}
