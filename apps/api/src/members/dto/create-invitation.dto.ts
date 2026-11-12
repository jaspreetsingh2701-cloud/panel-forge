import { IsEmail, IsIn, IsOptional } from 'class-validator';
export class CreateInvitationDto {
  @IsEmail()
  email!: string;
  @IsOptional()
  @IsIn(['ADMIN', 'MEMBER'])
  role?: 'ADMIN' | 'MEMBER';
}