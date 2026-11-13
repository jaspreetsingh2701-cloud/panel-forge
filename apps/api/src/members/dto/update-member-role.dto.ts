import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['ADMIN', 'MEMBER'], example: 'ADMIN' })
  @IsIn(['ADMIN', 'MEMBER'])
  role!: 'ADMIN' | 'MEMBER';
}
