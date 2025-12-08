import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageContentService } from './page-content.service';
import { PageContentController } from './page-content.controller';
import { PageContent } from './entities/page-content.entity';
import { ContentItem } from './entities/content-item.entity';
import { Topic } from '../topic/entities/topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PageContent, ContentItem, Topic])],
  controllers: [PageContentController],
  providers: [PageContentService],
  exports: [PageContentService],
})
export class PageContentModule {}
