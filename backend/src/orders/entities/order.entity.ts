import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { OrderOperation } from './order-operation.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  machine_name?: string;

  @Column({ type: 'varchar', length: 100 })
  blueprint_number!: string;

  // Важное изменение: start_date обязательное, устанавливаем значение по умолчанию
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  start_date!: Date;

  @Column({ type: 'timestamp' })
  deadline!: Date;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'varchar', nullable: true })
  pdf_path?: string;

  // Разрешаем NULL для drawing_url
  @Column({ type: 'varchar', nullable: true })
  drawing_url?: string;

  @Column({ type: 'varchar', nullable: true })
  preview_url?: string;

  @Column({ type: 'timestamp', nullable: true })
  estimated_completion?: Date;

  @Column({ type: 'int', nullable: true })
  estimated_workdays?: number;

  @Column({ type: 'boolean', default: true })
  will_meet_deadline!: boolean;

  @Column({ type: 'int', default: 0 })
  time_margin!: number;

  @Column({ type: 'int', default: 0 })
  completed_quantity!: number;

  @Column({ type: 'int' })
  remaining_quantity!: number;

  @Column({ type: 'int', default: 1 })
  priority!: number;

  @Column({ type: 'varchar', nullable: true })
  material_type?: string;

  @Column({ type: 'varchar', default: 'новый' })
  status!: string;

  // Связь для operations
  @OneToMany(() => OrderOperation, (operation) => operation.order, {
    cascade: true,
    eager: true,
  })
  operations!: OrderOperation[];
}