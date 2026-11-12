import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
export class CreateResourceDto {
 @IsString() @MaxLength(80) name!: string;
 @IsString() @MaxLength(64) @Matches(/^[a-z][a-z0-9_]*$/) key!: string;
 @IsOptional() @IsString() @MaxLength(240) description?: string;
}