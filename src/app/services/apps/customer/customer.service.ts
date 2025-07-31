import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Customer } from 'src/app/pages/apps/customer/customer';
import { PaginatedResponse } from 'src/app/shared/models/PaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private baseUrl = 'https://localhost:7149/api/Cliente'; // cambia por tu URL real

  constructor(private http: HttpClient) {}

  public getCustomers(
    search: string,
    pageSize: number,
    pageIndex: number
  ): Observable<PaginatedResponse<Customer>> {
    const params = new HttpParams()
      .set('search', search)
      .set('pageSize', pageSize)
      .set('pageIndex', pageIndex);

    return this.http.get<PaginatedResponse<Customer>>(this.baseUrl, { params });
  }

  public add(customer: Customer): Observable<any> {
    return this.http.post(this.baseUrl, customer);
  }

  public getById(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  public update(id: string, customer: Customer): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, customer);
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
