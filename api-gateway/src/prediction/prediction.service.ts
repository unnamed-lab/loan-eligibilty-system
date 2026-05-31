import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePredictionDto } from '../common/dto/create-prediction.dto';
import { encodeApplicant } from '../common/feature-contract';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);
  private readonly inferenceUrl =
    process.env.INFERENCE_URL || 'http://inference-engine:8081';
  private readonly shapUrl = process.env.SHAP_URL || 'http://shap-service:8000';

  constructor(
    private readonly http: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async predict(dto: CreatePredictionDto, userId?: string) {
    // 1. Encode raw applicant -> ordered float vector (shared contract).
    const features = encodeApplicant(dto as any);

    // 2. Call the Rust inference engine for the decision.
    let decision: { eligible: boolean; probability: number; latency_ms: number };
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.inferenceUrl}/predict`, { features }),
      );
      decision = res.data;
    } catch (e) {
      this.logger.error(`Inference engine unreachable: ${e.message}`);
      throw new ServiceUnavailableException('Inference engine unavailable');
    }

    // 3. Call the SHAP sidecar for reasons (non-fatal: degrade gracefully).
    let reasons: string[] = [];
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.shapUrl}/explain`, { features }),
      );
      reasons = res.data.top_reasons ?? [];
    } catch (e) {
      this.logger.warn('SHAP service unavailable, returning decision without reasons');
    }

    // 4. Persist audit log.
    const log = await this.prisma.predictionLog.create({
      data: {
        input: dto as any,
        featureVector: features,
        eligible: decision.eligible,
        probability: decision.probability,
        reasons,
        requestedBy: userId,
        inferenceLatencyMs: decision.latency_ms,
      },
    });

    // 5. Assemble response.
    return {
      applicationId: log.id,
      eligible: decision.eligible,
      probability: Number(decision.probability.toFixed(4)),
      decision: decision.eligible ? 'APPROVED' : 'REJECTED',
      reasons,
      inferenceLatencyMs: decision.latency_ms,
    };
  }

  findLog(id: string) {
    return this.prisma.predictionLog.findUnique({ where: { id } });
  }

  recentLogs(limit = 50) {
    return this.prisma.predictionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
