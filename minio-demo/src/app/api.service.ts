import { Injectable } from '@angular/core';
import { HttpClient} from  '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  constructor(private  httpClient:  HttpClient) {}

  getInfo() {
    return this.httpClient.get('/api/info');
  }

  prepareBucket() {
    return this.httpClient.get('/api/create-bucket');
  }

  readBucket() {
    return this.httpClient.get('/api/get-bucket-content');
  }

}
