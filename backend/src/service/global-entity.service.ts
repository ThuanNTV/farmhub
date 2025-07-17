import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/global/user.entity';
import { Bank } from '../entities/global/bank.entity';
import { Unit } from '../entities/global/unit.entity';
import { PaymentMethod } from '../entities/global/payment_method.entity';
import { Store } from '../entities/global/store.entity';

/**
 * Service để truy cập các global entities từ tenant context
 * Giải quyết vấn đề cross-database relationships trong multi-tenant architecture
 */
@Injectable()
export class GlobalEntityService {
  constructor(
    @InjectRepository(User, 'globalConnection')
    private userRepository: Repository<User>,

    @InjectRepository(Bank, 'globalConnection')
    private bankRepository: Repository<Bank>,

    @InjectRepository(Unit, 'globalConnection')
    private unitRepository: Repository<Unit>,

    @InjectRepository(PaymentMethod, 'globalConnection')
    private paymentMethodRepository: Repository<PaymentMethod>,

    @InjectRepository(Store, 'globalConnection')
    private storeRepository: Repository<Store>,
  ) {}

  /**
   * Lấy User theo ID
   * @param userId - UUID của user
   * @returns User entity hoặc null nếu không tìm thấy
   */
  async getUserById(userId: string): Promise<User | null> {
    if (!userId) return null;

    try {
      return await this.userRepository.findOne({
        where: { user_id: userId },
      });
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Lấy Bank theo ID
   * @param bankId - ID của bank
   * @returns Bank entity hoặc null nếu không tìm thấy
   */
  async getBankById(bankId: string): Promise<Bank | null> {
    if (!bankId) return null;

    try {
      return await this.bankRepository.findOne({
        where: { id: bankId },
      });
    } catch (error) {
      console.error(`Error fetching bank ${bankId}:`, error);
      return null;
    }
  }

  /**
   * Lấy Unit theo ID
   * @param unitId - UUID của unit
   * @returns Unit entity hoặc null nếu không tìm thấy
   */
  async getUnitById(unitId: string): Promise<Unit | null> {
    if (!unitId) return null;

    try {
      return await this.unitRepository.findOne({
        where: { id: unitId },
      });
    } catch (error) {
      console.error(`Error fetching unit ${unitId}:`, error);
      return null;
    }
  }

  /**
   * Lấy PaymentMethod theo ID
   * @param paymentMethodId - UUID của payment method
   * @returns PaymentMethod entity hoặc null nếu không tìm thấy
   */
  async getPaymentMethodById(
    paymentMethodId: string,
  ): Promise<PaymentMethod | null> {
    if (!paymentMethodId) return null;

    try {
      return await this.paymentMethodRepository.findOne({
        where: { id: paymentMethodId },
      });
    } catch (error) {
      console.error(`Error fetching payment method ${paymentMethodId}:`, error);
      return null;
    }
  }

  /**
   * Lấy Store theo ID
   * @param storeId - UUID của store
   * @returns Store entity hoặc null nếu không tìm thấy
   */
  async getStoreById(storeId: string): Promise<Store | null> {
    if (!storeId) return null;

    try {
      return await this.storeRepository.findOne({
        where: { store_id: storeId },
      });
    } catch (error) {
      console.error(`Error fetching store ${storeId}:`, error);
      return null;
    }
  }

  /**
   * Validate multiple foreign key references
   * @param references - Object chứa các foreign key cần validate
   * @returns Object chứa thông tin validation
   */
  async validateReferences(references: {
    userId?: string;
    bankId?: string;
    unitId?: string;
    paymentMethodId?: string;
    storeId?: string;
  }): Promise<{
    valid: boolean;
    errors: string[];
    data: {
      user?: User;
      bank?: Bank;
      unit?: Unit;
      paymentMethod?: PaymentMethod;
      store?: Store;
    };
  }> {
    const errors: string[] = [];
    const data: any = {};

    if (references.userId) {
      data.user = await this.getUserById(references.userId);
      if (!data.user) {
        errors.push(`User not found: ${references.userId}`);
      }
    }

    if (references.bankId) {
      data.bank = await this.getBankById(references.bankId);
      if (!data.bank) {
        errors.push(`Bank not found: ${references.bankId}`);
      }
    }

    if (references.unitId) {
      data.unit = await this.getUnitById(references.unitId);
      if (!data.unit) {
        errors.push(`Unit not found: ${references.unitId}`);
      }
    }

    if (references.paymentMethodId) {
      data.paymentMethod = await this.getPaymentMethodById(
        references.paymentMethodId,
      );
      if (!data.paymentMethod) {
        errors.push(`Payment method not found: ${references.paymentMethodId}`);
      }
    }

    if (references.storeId) {
      data.store = await this.getStoreById(references.storeId);
      if (!data.store) {
        errors.push(`Store not found: ${references.storeId}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      data,
    };
  }

  /**
   * Lấy tất cả Banks để sử dụng trong dropdown
   * @returns Array of Bank entities
   */
  async getAllBanks(): Promise<Bank[]> {
    try {
      return await this.bankRepository.find({
        order: { name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching all banks:', error);
      return [];
    }
  }

  /**
   * Lấy tất cả Units để sử dụng trong dropdown
   * @returns Array of Unit entities
   */
  async getAllUnits(): Promise<Unit[]> {
    try {
      return await this.unitRepository.find({
        order: { name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching all units:', error);
      return [];
    }
  }

  /**
   * Lấy tất cả Payment Methods để sử dụng trong dropdown
   * @returns Array of PaymentMethod entities
   */
  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await this.paymentMethodRepository.find({
        order: { name: 'ASC' },
      });
    } catch (error) {
      console.error('Error fetching all payment methods:', error);
      return [];
    }
  }
}
