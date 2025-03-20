import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsInt, IsString } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsInt()
  completedQuantity?: number;

  @IsOptional()
  @IsString()
  status?: string;
}