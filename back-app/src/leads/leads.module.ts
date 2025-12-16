import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { Property } from '../property/entities/property.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Property])],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}