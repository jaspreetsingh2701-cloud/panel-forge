import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsIn,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

class BuilderLayoutDto {
  @IsIn(['full', 'half', 'third'])
  width!: 'full' | 'half' | 'third';

  @IsIn(['compact', 'comfortable', 'spacious'])
  spacing!: 'compact' | 'comfortable' | 'spacious';
}

class BuilderComponentDto {
  @IsUUID()
  id!: string;

  @IsIn(['text', 'metric', 'table', 'form', 'chart'])
  type!: 'text' | 'metric' | 'table' | 'form' | 'chart';

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title!: string;

  @IsString()
  @MaxLength(500)
  description!: string;

  @IsString()
  @MaxLength(5000)
  content!: string;

  @ValidateNested()
  @Type(() => BuilderLayoutDto)
  layout!: BuilderLayoutDto;
}

export class SaveBuilderConfigurationDto {
  @IsInt()
  @Min(0)
  expectedVersion!: number;

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BuilderComponentDto)
  components!: BuilderComponentDto[];
}
