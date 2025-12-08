import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUser } from '../auth/types/jwt-user.type';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTopicDto: CreateTopicDto, @GetUser() user: JwtUser) {
    return this.topicService.create(user.id, createTopicDto.title);
  }

  @Get()
  async findAll() {
    return this.topicService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.topicService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTopicDto: UpdateTopicDto,
    @GetUser() user: JwtUser,
  ) {
    return this.topicService.update(id, user.id, updateTopicDto.title);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @GetUser() user: JwtUser) {
    await this.topicService.remove(id, user.id);
  }
}
