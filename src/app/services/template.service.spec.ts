import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { TemplateService } from './template.service';
import { Server } from '../models/server';
import { HttpServer } from './http-server.service';
import { AppTestingModule } from '../testing/app-testing/app-testing.module';

describe('TemplateService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let service: TemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AppTestingModule],
      providers: [TemplateService, HttpServer]
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    service = TestBed.get(TemplateService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should ask for the list from server', () => {
    const server = new Server();
    server.ip = '127.0.0.1';
    server.port = 3080;
    server.authorization = 'none';

    service.list(server).subscribe(() => {});

    httpTestingController.expectOne('http://127.0.0.1:3080/v2/templates');
  });
});
