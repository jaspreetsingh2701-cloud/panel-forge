import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateApplicationDto {
  @IsString() @MinLength(1) @MaxLength(80)
  name!: string;
  @IsOptional() @IsString() @MaxLength(240)
  description?: string;
  @IsOptional() @IsString() @IsIn(['blank', 'operations', 'crm'])
  template?: string;
}