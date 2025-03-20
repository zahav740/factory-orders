import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Orders E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  let createdOrderId: number;

  it('Создание заказа /orders (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .send({
        machineName: 'CNC-1',
        blueprintNumber: 'BP-123456',
        startDate: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        quantity: 10,
        drawingUrl: 'http://example.com/drawing.pdf',
        willMeetDeadline: true,
        timeMargin: 5,
        completedQuantity: 0,
        remainingQuantity: 10,
        priority: 1,
        status: 'pending',
      })
      .expect(201);

    createdOrderId = response.body.id;
    expect(createdOrderId).toBeDefined();
  });

  it('Получение всех заказов /orders (GET)', () => {
    return request(app.getHttpServer())
      .get('/orders')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('Получение заказа по ID /orders/:id (GET)', () => {
    return request(app.getHttpServer())
      .get(`/orders/${createdOrderId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(createdOrderId);
      });
  });

  it('Обновление заказа /orders/:id (PATCH)', () => {
    return request(app.getHttpServer())
      .patch(`/orders/${createdOrderId}`)
      .send({ status: 'completed' })
      .expect(200);
  });

  it('Удаление заказа /orders/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/orders/${createdOrderId}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
