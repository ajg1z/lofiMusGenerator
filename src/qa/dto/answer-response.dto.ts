import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { SourceDto } from './source.dto';

export class AnswerResponseDto {
  @IsString()
  answer!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceDto)
  sources!: SourceDto[];

  @IsArray()
  citations!: string[];

  @IsObject()
  rawSearch!: Record<string, unknown>;
}
