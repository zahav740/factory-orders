import { IsString, IsInt, IsOptional, IsBoolean, IsDateString, Min, MaxLength, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class OperationDto {
  @IsInt()
  op_number!: number;

  @IsInt()
  @Min(1)
  op_time!: number;

  @IsString()
  @MaxLength(10)
  op_axes!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  assigned_machine?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  machine_name?: string;

  @IsString()
  @MaxLength(100)
  blueprint_number!: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsDateString()
  deadline!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  pdf_path?: string;

  @IsString()
  drawing_url!: string;

  @IsOptional()
  @IsString()
  preview_url?: string;

  @IsOptional()
  @IsDateString()
  estimated_completion?: string;

  @IsOptional()
  @IsInt()
  estimated_workdays?: number;

  @IsBoolean()
  will_meet_deadline!: boolean;

  @IsInt()
  time_margin!: number;

  @IsInt()
  completed_quantity!: number;

  @IsInt()
  remaining_quantity!: number;

  @IsInt()
  priority!: number;

  @IsOptional()
  @IsString()
  material_type?: string;

  @IsString()
  status!: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OperationDto)
  @ArrayMaxSize(6)
  operations?: OperationDto[];
}