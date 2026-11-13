import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({ example: 'Operations dashboard', minLength: 1, maxLength: 80 })
  @IsString() @MinLength(1) @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: 'Internal operations workspace', maxLength: 240 })
  @IsOptional() @IsString() @MaxLength(240)
  description?: string;

  @ApiPropertyOptional({ enum: ['blank', 'operations', 'crm'], example: 'blank' })
  @IsOptional() @IsString() @IsIn(['blank', 'operations', 'crm'])
  template?: string;
}
