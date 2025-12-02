import { IsOptional, IsString, IsUrl } from 'class-validator';

export class SourceDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  snippet?: string;
}
