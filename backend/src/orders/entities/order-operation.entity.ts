import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_operations')
export class OrderOperation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  op_number!: number;

  @Column()
  op_time!: number;

  @Column({ length: 10 })
  op_axes!: string;

  @Column({ length: 255, nullable: true })
  assigned_machine?: string;

  @Column({ type: 'timestamp', nullable: true })
  start_date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_date?: Date;

  @ManyToOne(() => Order, (order) => order.operations, { onDelete: 'CASCADE' })
  order!: Order;
}