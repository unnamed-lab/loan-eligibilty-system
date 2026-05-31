import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PredictionService } from './prediction.service';
import { PredictionController } from './prediction.controller';

@Module({
  imports: [HttpModule],
  providers: [PredictionService],
  controllers: [PredictionController],
})
export class PredictionModule {}
