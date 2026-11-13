import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Matches, Min } from 'class-validator';
export class CreateFieldDto {
 @IsString() @MaxLength(80) name!: string;
 @IsString() @MaxLength(64) @Matches(/^[a-z][a-z0-9_]*$/) key!: string;
 @IsIn(['TEXT','NUMBER','BOOLEAN','DATE','SELECT','RELATION']) type!: 'TEXT'|'NUMBER'|'BOOLEAN'|'DATE'|'SELECT'|'RELATION';
 @IsOptional() @IsBoolean() required?: boolean;
 @IsOptional() @IsArray() @IsString({each:true}) options?: string[];
 @IsOptional() @IsString() relationResourceId?: string;
 @IsOptional() @IsInt() @Min(0) position?: number;
}