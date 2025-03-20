// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderOperation } from './entities/order-operation.entity'; // Добавьте импорт

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderOperation])], // Добавьте обе сущности
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}