import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Matches, Min } from 'class-validator';

export class CreateFieldDto {
  @ApiProperty({ example: 'Email address', maxLength: 80 })
  @IsString() @MaxLength(80)
  name!: string;

  @ApiProperty({ example: 'email', pattern: '^[a-z][a-z0-9_]*$', maxLength: 64 })
  @IsString() @MaxLength(64) @Matches(/^[a-z][a-z0-9_]*$/)
  key!: string;

  @ApiProperty({ enum: ['TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'RELATION'], example: 'TEXT' })
  @IsIn(['TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'SELECT', 'RELATION'])
  type!: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' | 'RELATION';

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['Open', 'Closed'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  options?: string[];

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional() @IsString()
  relationResourceId?: string;

  @ApiPropertyOptional({ minimum: 0, example: 0 })
  @IsOptional() @IsInt() @Min(0)
  position?: number;
}
