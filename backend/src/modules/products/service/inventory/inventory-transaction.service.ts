import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { TenantDataSourceService } from '../../../../config/db/dbtenant/tenant-datasource.service';
import { Product } from '../../../../entities/tenant/product.entity';
import { EntityManager } from 'typeorm';

/**
 * Service for handling inventory operations within database transactions
 * This service provides atomic inventory management for use within larger transactions
 */
@Injectable()
export class InventoryTransactionService {
  private readonly logger = new Logger(InventoryTransactionService.name);

  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  /**
   * Validate stock availability for multiple products
   * @param storeId Store ID
   * @param items Array of {productId, quantity}
   * @returns Array of validated products with current stock
   */
  async validateStockAvailability(
    storeId: string,
    items: Array<{ productId: string; quantity: number }>,
  ): Promise<Product[]> {
    try {
      this.logger.debug(
        `Validating stock availability for ${items.length} products in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);

      const validatedProducts: Product[] = [];

      for (const item of items) {
        const product = await productRepo.findOne({
          where: {
            product_id: item.productId,
            is_deleted: false,
            is_active: true,
          },
        });

        if (!product) {
          throw new BadRequestException(
            `❌ Sản phẩm với ID "${item.productId}" không tồn tại`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `❌ Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho, không đủ cho đơn hàng ${item.quantity}`,
          );
        }

        validatedProducts.push(product);
      }

      this.logger.log(
        `Stock validation completed successfully for ${validatedProducts.length} products`,
      );

      return validatedProducts;
    } catch (error) {
      this.logger.error(
        `Failed to validate stock availability: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Decrease stock for multiple products using pessimistic locking within transaction
   * @param items Array of {productId, quantity}
   * @param manager EntityManager for transaction
   */
  async decreaseStock(
    items: Array<{ productId: string; quantity: number }>,
    manager: EntityManager,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Decreasing stock for ${items.length} products within transaction`,
      );

      const productRepo = manager.getRepository(Product);

      for (const item of items) {
        // Use pessimistic locking to prevent race conditions
        const product = await productRepo.findOne({
          where: {
            product_id: item.productId,
            is_deleted: false,
            is_active: true,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException(
            `❌ Sản phẩm với ID "${item.productId}" không tồn tại`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `❌ Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho, không đủ cho đơn hàng ${item.quantity}`,
          );
        }

        // Update stock
        product.stock -= item.quantity;
        product.updated_at = new Date();

        await productRepo.save(product);

        this.logger.debug(
          `Stock decreased for product ${product.name} (ID: ${item.productId}): ${item.quantity} units`,
        );
      }

      this.logger.log(
        `Stock decrease completed successfully for ${items.length} products`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to decrease stock within transaction: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Increase stock for multiple products (for order cancellation) within transaction
   * @param items Array of {productId, quantity}
   * @param manager EntityManager for transaction
   */
  async increaseStock(
    items: Array<{ productId: string; quantity: number }>,
    manager: EntityManager,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Increasing stock for ${items.length} products within transaction`,
      );

      const productRepo = manager.getRepository(Product);

      for (const item of items) {
        const product = await productRepo.findOne({
          where: {
            product_id: item.productId,
            is_deleted: false,
            is_active: true,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException(
            `❌ Sản phẩm với ID "${item.productId}" không tồn tại`,
          );
        }

        // Update stock
        product.stock += item.quantity;
        product.updated_at = new Date();

        await productRepo.save(product);

        this.logger.debug(
          `Stock increased for product ${product.name} (ID: ${item.productId}): ${item.quantity} units`,
        );
      }

      this.logger.log(
        `Stock increase completed successfully for ${items.length} products`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to increase stock within transaction: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Reserve stock for multiple products (for pending orders) within transaction
   * @param items Array of {productId, quantity}
   * @param manager EntityManager for transaction
   */
  async reserveStock(
    items: Array<{ productId: string; quantity: number }>,
    manager: EntityManager,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Reserving stock for ${items.length} products within transaction`,
      );

      const productRepo = manager.getRepository(Product);

      for (const item of items) {
        const product = await productRepo.findOne({
          where: {
            product_id: item.productId,
            is_deleted: false,
            is_active: true,
          },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new BadRequestException(
            `❌ Sản phẩm với ID "${item.productId}" không tồn tại`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `❌ Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho, không đủ để reserved ${item.quantity}`,
          );
        }

        // Update reserved stock (assuming we have a reserved_stock field)
        // If not, we can add this field to the Product entity
        // For now, we'll decrease available stock
        product.stock -= item.quantity;
        product.updated_at = new Date();

        await productRepo.save(product);

        this.logger.debug(
          `Stock reserved for product ${product.name} (ID: ${item.productId}): ${item.quantity} units`,
        );
      }

      this.logger.log(
        `Stock reservation completed successfully for ${items.length} products`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to reserve stock within transaction: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Release reserved stock for multiple products (for cancelled orders) within transaction
   * @param items Array of {productId, quantity}
   * @param manager EntityManager for transaction
   */
  async releaseReservedStock(
    items: Array<{ productId: string; quantity: number }>,
    manager: EntityManager,
  ): Promise<void> {
    try {
      this.logger.debug(
        `Releasing reserved stock for ${items.length} products within transaction`,
      );

      // This is essentially the same as increaseStock for now
      await this.increaseStock(items, manager);

      this.logger.log(
        `Reserved stock release completed successfully for ${items.length} products`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to release reserved stock within transaction: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  /**
   * Update stock for a single product within transaction
   * @param productId Product ID
   * @param newStock New stock amount
   * @param manager EntityManager for transaction
   */
  async updateStock(
    productId: string,
    newStock: number,
    manager: EntityManager,
  ): Promise<Product> {
    try {
      this.logger.debug(
        `Updating stock for product ${productId} to ${newStock} within transaction`,
      );

      const productRepo = manager.getRepository(Product);

      const product = await productRepo.findOne({
        where: {
          product_id: productId,
          is_deleted: false,
          is_active: true,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new BadRequestException(
          `❌ Sản phẩm với ID "${productId}" không tồn tại`,
        );
      }

      if (newStock < 0) {
        throw new BadRequestException(`❌ Số lượng tồn kho không thể âm`);
      }

      const oldStock = product.stock;
      product.stock = newStock;
      product.updated_at = new Date();

      const updatedProduct = await productRepo.save(product);

      this.logger.log(
        `Stock updated for product ${product.name} (ID: ${productId}): ${oldStock} → ${newStock}`,
      );

      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Failed to update stock within transaction: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
