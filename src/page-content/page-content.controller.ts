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
import { PageContentService } from './page-content.service';
import { CreatePageContentDto } from './dto/create-page-content.dto';
import { UpdatePageContentDto } from './dto/update-page-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtUser } from '../auth/types/jwt-user.type';

@Controller('page-contents')
@UseGuards(JwtAuthGuard)
export class PageContentController {
  constructor(private readonly pageContentService: PageContentService) {}

  @Post(':topicId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('topicId') topicId: string,
    @Body() createPageContentDto: CreatePageContentDto,
    @GetUser() user: JwtUser,
  ) {
    return this.pageContentService.create(
      topicId,
      user.id,
      createPageContentDto.title,
      createPageContentDto.content,
    );
  }

  @Get()
  async findAll(@Query('topicId') topicId?: string) {
    if (topicId) {
      return this.pageContentService.findByTopicId(topicId);
    }
    return this.pageContentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.pageContentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePageContentDto: UpdatePageContentDto,
    @GetUser() user: JwtUser,
  ) {
    return this.pageContentService.update(
      id,
      user.id,
      updatePageContentDto.title,
      updatePageContentDto.content,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @GetUser() user: JwtUser) {
    await this.pageContentService.remove(id, user.id);
  }
}
