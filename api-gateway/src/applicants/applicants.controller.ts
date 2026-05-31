import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto, UpdateApplicantDto } from './dto/applicant.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('applicants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applicants')
export class ApplicantsController {
  constructor(private readonly service: ApplicantsService) {}

  @Post() create(@Body() body: CreateApplicantDto) {
    return this.service.create(body);
  }

  @Get() findAll() {
    return this.service.findAll();
  }

  @Get(':id') findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id') update(@Param('id') id: string, @Body() body: UpdateApplicantDto) {
    return this.service.update(id, body);
  }

  @Delete(':id') remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
