import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { LeadsModule } from './leads/leads.module';
import { PropertyModule } from './property/property.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    LeadsModule,
    PropertyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}