import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RepetitionService } from './repetition.service';
import { CreateRepetitionDto } from './dto/create-repetition.dto';
import { UpdateRepetitionDto } from './dto/update-repetition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUser } from '../auth/types/jwt-user.type';

@Controller('repetitions')
@UseGuards(JwtAuthGuard)
export class RepetitionController {
  constructor(private readonly repetitionService: RepetitionService) {}

  @Post(':topicId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('topicId') topicId: string,
    @Body() createRepetitionDto: CreateRepetitionDto,
    @GetUser() user: JwtUser,
  ) {
    return this.repetitionService.create(
      topicId,
      user.id,
      createRepetitionDto.repeatCount,
      createRepetitionDto.interval,
    );
  }

  @Get()
  async findAll(@Query('userId') userId?: string, @GetUser() user?: JwtUser) {
    const filterUserId = userId || user?.id;
    return this.repetitionService.findAll(filterUserId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.repetitionService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRepetitionDto: UpdateRepetitionDto,
    @GetUser() user: JwtUser,
  ) {
    return this.repetitionService.update(id, user.id, {
      repeatCount: updateRepetitionDto.repeatCount,
      interval: updateRepetitionDto.interval,
      isActive: updateRepetitionDto.isActive,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @GetUser() user: JwtUser) {
    await this.repetitionService.remove(id, user.id);
  }
}
