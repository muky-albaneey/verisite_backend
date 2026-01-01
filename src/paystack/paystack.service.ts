import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface PaystackBank {
  name: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  is_deleted: boolean;
  country: string;
  currency: string;
  type: string;
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaystackAccountVerification {
  account_number: string;
  account_name: string;
  bank_id: number;
}

@Injectable()
export class PaystackService {
  private apiClient: AxiosInstance;
  private secretKey: string;

  constructor(private configService: ConfigService) {
    const paystackConfig = this.configService.get('paystack');
    this.secretKey = paystackConfig.secretKey;

    this.apiClient = axios.create({
      baseURL: paystackConfig.baseUrl,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async initializeTransaction(data: {
    email: string;
    amount: number;
    reference?: string;
    metadata?: any;
  }) {
    const response = await this.apiClient.post('/transaction/initialize', data);
    return response.data;
  }

  async verifyTransaction(reference: string) {
    const response = await this.apiClient.get(`/transaction/verify/${reference}`);
    return response.data;
  }

  async getBanks(): Promise<PaystackBank[]> {
    const response = await this.apiClient.get('/bank?country=nigeria');
    return response.data.data;
  }

  async verifyAccount(accountNumber: string, bankCode: string): Promise<PaystackAccountVerification> {
    const response = await this.apiClient.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    );
    return response.data.data;
  }

  async createTransferRecipient(data: {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
  }) {
    const response = await this.apiClient.post('/transferrecipient', data);
    return response.data;
  }

  async initiateTransfer(data: {
    source: string;
    amount: number;
    recipient: string;
    reason?: string;
    reference?: string;
  }) {
    const response = await this.apiClient.post('/transfer', data);
    return response.data;
  }
}

