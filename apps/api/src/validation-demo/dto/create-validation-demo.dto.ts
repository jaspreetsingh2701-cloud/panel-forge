
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// Defines the accepted structure of our demo request.
export class CreateValidationDemoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  // Convert numeric strings into numbers before validation.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  age!: number;
}
