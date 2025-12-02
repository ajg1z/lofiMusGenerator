import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class QuestionRequestDto {
  @IsString()
  @MinLength(8)
  question!: string;

  @IsOptional()
  @IsString()
  focus?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  maxSearchResults = 5;
}
