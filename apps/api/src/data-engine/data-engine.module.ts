import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DataEngineController } from './data-engine.controller';
import { DataEngineService } from './data-engine.service';
@Module({ imports:[AuthModule],controllers:[DataEngineController],providers:[DataEngineService] })
export class DataEngineModule {}