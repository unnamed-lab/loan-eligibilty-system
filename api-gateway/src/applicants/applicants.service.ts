import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicantDto, UpdateApplicantDto } from './dto/applicant.dto';

@Injectable()
export class ApplicantsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateApplicantDto) {
    return this.prisma.applicant.create({ data });
  }

  findAll() {
    return this.prisma.applicant.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const applicant = await this.prisma.applicant.findUnique({ where: { id } });
    if (!applicant) throw new NotFoundException('Applicant not found');
    return applicant;
  }

  async update(id: string, data: UpdateApplicantDto) {
    await this.findOne(id); // 404 if missing
    return this.prisma.applicant.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id); // 404 if missing
    return this.prisma.applicant.delete({ where: { id } });
  }
}
