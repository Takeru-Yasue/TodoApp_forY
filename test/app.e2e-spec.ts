import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { join } from 'path';

describe('Todos (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.useGlobalPipes(new ValidationPipe());
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('ejs');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/todos (POST)', () => {
    return request(app.getHttpServer() as unknown)
      .post('/todos')
      .send({
        title: 'Test Todo',
        dueDate: '2026-12-31T23:59:59.999Z',
        period: '夜',
      })
      .expect(302)
      .expect('Location', '/todos');
  });

  it('/todos (GET)', () => {
    return request(app.getHttpServer() as unknown)
      .get('/todos')
      .expect(200)
      .expect('Content-Type', /html/);
  });
});
