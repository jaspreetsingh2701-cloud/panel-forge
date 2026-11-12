import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  // Normalize email so login is case-insensitive.
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  // Do not trim passwords: whitespace can be intentional.
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
