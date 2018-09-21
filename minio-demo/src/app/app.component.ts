import { Component, OnInit } from '@angular/core';
import { APIService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'minio-demo';
  private info;
  private files;
  constructor(private apiService: APIService) { }
  ngOnInit() {
    this.getAllData();
  }
  public getInfo() {
    return this.apiService.getInfo().subscribe((data: object) => {
      this.info = data;
      console.log(data);
    });
  }
  public prepareBucket() {
    return this.apiService.prepareBucket().subscribe((data: object) => {
      console.log(data);
    });
  }
  public readBucket() {
    return this.apiService.readBucket().subscribe((data: object) => {
      this.files = data;
      console.log(data);
    });
  }
  async getAllData() {
    await this.getInfo();
    await this.prepareBucket();
    await this.readBucket();
  }
}
