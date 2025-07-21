import { Injectable } from '@nestjs/common';
import { AuditLogAsyncService } from 'src/common/audit/audit-log-async.service';

/**
 * Ví dụ về cách sử dụng AuditLogAsyncService trong một service thực tế
 */
@Injectable()
export class ExampleProductService {
  constructor(private auditLogAsync: AuditLogAsyncService) {}

  /**
   * Ví dụ tạo product với audit log
   */
  async createProduct(
    productData: any,
    userId: string,
    userName: string,
    storeId: string,
  ) {
    try {
      // Tạo product (giả lập)
      const newProduct = {
        id: `product-${Date.now()}`,
        ...productData,
        created_at: new Date(),
      };

      // Ghi audit log bất đồng bộ
      await this.auditLogAsync.logCreate(
        userId,
        userName,
        'product',
        newProduct.id,
        newProduct,
        storeId,
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      );

      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Ví dụ cập nhật product với audit log
   */
  async updateProduct(
    productId: string,
    productData: any,
    userId: string,
    userName: string,
    storeId: string,
  ) {
    try {
      // Lấy dữ liệu cũ (giả lập)
      const oldProduct = {
        id: productId,
        name: 'Old Product Name',
        price: 100,
        updated_at: new Date(),
      };

      // Cập nhật product (giả lập)
      const updatedProduct = {
        ...oldProduct,
        ...productData,
        updated_at: new Date(),
      };

      // Ghi audit log bất đồng bộ
      await this.auditLogAsync.logUpdate(
        userId,
        userName,
        'product',
        productId,
        oldProduct,
        updatedProduct,
        storeId,
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      );

      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Ví dụ xóa product với audit log
   */
  async deleteProduct(
    productId: string,
    userId: string,
    userName: string,
    storeId: string,
  ) {
    try {
      // Lấy dữ liệu product trước khi xóa (giả lập)
      const productToDelete = {
        id: productId,
        name: 'Product to Delete',
        price: 150,
        deleted_at: new Date(),
      };

      // Xóa product (giả lập)
      // ... logic xóa ...

      // Ghi audit log bất đồng bộ
      await this.auditLogAsync.logDelete(
        userId,
        userName,
        'product',
        productId,
        productToDelete,
        storeId,
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      );

      return { message: 'Product deleted successfully' };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Ví dụ bulk operations với audit log
   */
  async bulkCreateProducts(
    productsData: any[],
    userId: string,
    userName: string,
    storeId: string,
  ) {
    try {
      // Tạo nhiều products (giả lập)
      const newProducts = productsData.map((data, index) => ({
        id: `product-${Date.now()}-${index}`,
        ...data,
        created_at: new Date(),
      }));

      // Chuẩn bị audit log data cho tất cả products
      const auditDataArray = newProducts.map((product) => ({
        userId,
        userName,
        action: 'CREATE' as const,
        targetTable: 'product',
        targetId: product.id,
        newValue: product,
        timestamp: new Date(),
        storeId,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }));

      // Ghi bulk audit log bất đồng bộ
      await this.auditLogAsync.logBulkActions(auditDataArray);

      return newProducts;
    } catch (error) {
      console.error('Error creating bulk products:', error);
      throw error;
    }
  }

  /**
   * Ví dụ critical action với audit log priority cao
   */
  async exportProductData(userId: string, userName: string, storeId: string) {
    try {
      // Export data logic (giả lập)
      const exportData = {
        exportType: 'CSV',
        recordCount: 1000,
        exportedAt: new Date(),
        fileSize: '2.5MB',
      };

      // Ghi critical audit log với priority cao
      await this.auditLogAsync.logCriticalAction(
        userId,
        userName,
        'EXPORT_DATA',
        'product',
        '',
        exportData,
        storeId,
        {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      );

      return exportData;
    } catch (error) {
      console.error('Error exporting product data:', error);
      throw error;
    }
  }

  /**
   * Ví dụ monitoring queue status
   */
  async getAuditLogQueueStatus() {
    try {
      const status = await this.auditLogAsync.getQueueStatus();
      return {
        message: 'Audit log queue status retrieved successfully',
        data: status,
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      throw error;
    }
  }

  /**
   * Ví dụ clear queue (chỉ dùng cho testing)
   */
  async clearAuditLogQueue() {
    try {
      await this.auditLogAsync.clearQueue();
      return { message: 'Audit log queue cleared successfully' };
    } catch (error) {
      console.error('Error clearing queue:', error);
      throw error;
    }
  }
}
