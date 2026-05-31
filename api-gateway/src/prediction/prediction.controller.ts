import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PredictionService } from './prediction.service';
import { CreatePredictionDto } from '../common/dto/create-prediction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('prediction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('predict')
export class PredictionController {
  constructor(private readonly service: PredictionService) {}

  @Post()
  predict(@Body() dto: CreatePredictionDto, @Req() req: any) {
    return this.service.predict(dto, req.user?.userId);
  }

  @Get('logs')
  logs(@Query('limit') limit?: string) {
    return this.service.recentLogs(limit ? +limit : 50);
  }

  @Get('logs/:id')
  log(@Param('id') id: string) {
    return this.service.findLog(id);
  }
}
