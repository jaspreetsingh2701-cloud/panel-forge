import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({ example: 'Customer', maxLength: 80 })
  @IsString() @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'customers', pattern: '^[a-z][a-z0-9_]*$', maxLength: 64 })
  @IsString() @MaxLength(64) @Matches(/^[a-z][a-z0-9_]*$/)
  key!: string;

  @ApiPropertyOptional({ example: 'Customer records', maxLength: 240 })
  @IsOptional() @IsString() @MaxLength(240)
  description?: string;
}
