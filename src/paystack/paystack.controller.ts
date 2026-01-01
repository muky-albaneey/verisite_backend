import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaystackService } from './paystack.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Paystack')
@Controller('paystack')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Get('banks')
  @ApiOperation({ summary: 'Get list of banks' })
  async getBanks() {
    const banks = await this.paystackService.getBanks();
    return { data: banks };
  }

  @Post('verify-account')
  @ApiOperation({ summary: 'Verify bank account' })
  async verifyAccount(@Body('accountNumber') accountNumber: string, @Body('bankCode') bankCode: string) {
    const result = await this.paystackService.verifyAccount(accountNumber, bankCode);
    return { data: result };
  }
}

