import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class UpsertRecordDto {
  @ApiProperty({ type: 'object', additionalProperties: true, example: { name: 'Acme Ltd', status: 'Open' } })
  @IsObject()
  data!: Record<string, unknown>;
}
