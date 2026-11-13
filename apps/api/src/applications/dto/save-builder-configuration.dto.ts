import { ApiProperty, ApiPropertyNested } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayUnique, IsArray, IsDefined, IsInt, IsIn,
  IsNotEmpty, IsString, IsUUID, MaxLength, Min, ValidateNested,
} from 'class-validator';

class BuilderLayoutDto {
  @ApiProperty({ enum: ['full', 'half', 'third'], example: 'full' })
  @IsIn(['full', 'half', 'third'])
  width!: 'full' | 'half' | 'third';

  @ApiProperty({ enum: ['compact', 'comfortable', 'spacious'], example: 'comfortable' })
  @IsIn(['compact', 'comfortable', 'spacious'])
  spacing!: 'compact' | 'comfortable' | 'spacious';
}

class BuilderComponentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id!: string;

  @ApiProperty({ enum: ['text', 'metric', 'table', 'form', 'chart'], example: 'text' })
  @IsIn(['text', 'metric', 'table', 'form', 'chart'])
  type!: 'text' | 'metric' | 'table' | 'form' | 'chart';

  @ApiProperty({ example: 'Welcome', maxLength: 120 })
  @IsString() @IsNotEmpty() @MaxLength(120)
  title!: string;

  @ApiProperty({ example: 'Overview of this workspace', maxLength: 500 })
  @IsString() @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 'Hello world', maxLength: 5000 })
  @IsString() @MaxLength(5000)
  content!: string;

  @ApiPropertyNested({ type: BuilderLayoutDto })
  @IsDefined() @ValidateNested() @Type(() => BuilderLayoutDto)
  layout!: BuilderLayoutDto;
}

export class SaveBuilderConfigurationDto {
  @ApiProperty({ minimum: 0, example: 2, description: 'Version last read by the client; prevents overwriting newer edits.' })
  @IsInt() @Min(0)
  expectedVersion!: number;

  @ApiProperty({ type: [BuilderComponentDto], maxItems: 100 })
  @IsArray() @ArrayMaxSize(100)
  @ArrayUnique((component: BuilderComponentDto) => component.id)
  @ValidateNested({ each: true }) @Type(() => BuilderComponentDto)
  components!: BuilderComponentDto[];
}
