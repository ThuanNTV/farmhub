import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { ProductVariant } from 'src/entities/tenant/product_variant.entity';
import { ProductAttribute } from 'src/entities/tenant/product_attribute.entity';
import { ProductVariantAttribute } from 'src/entities/tenant/product_variant_attribute.entity';
import { Product } from 'src/entities/tenant/product.entity';
import { AuditLogsService } from 'src/modules/audit-logs/service/audit-logs.service';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
  CreateProductAttributeDto,
  ProductVariantResponseDto,
  ProductAttributeResponseDto,
  ProductWithVariantsResponseDto,
  VariantFilterDto,
} from '../dto/product-variants.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductVariantsService {
  private readonly logger = new Logger(ProductVariantsService.name);

  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  /**
   * Create a new product attribute
   * @param storeId - Store ID
   * @param createDto - Attribute creation data
   * @returns Created attribute
   */
  async createAttribute(
    storeId: string,
    createDto: CreateProductAttributeDto,
  ): Promise<ProductAttributeResponseDto> {
    try {
      this.logger.log(
        `Creating product attribute: ${createDto.name} in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const attributeRepo = dataSource.getRepository(ProductAttribute);

      // Check if attribute name already exists
      const existingAttribute = await attributeRepo.findOne({
        where: { name: createDto.name, is_deleted: false },
      });

      if (existingAttribute) {
        throw new ConflictException(
          `Attribute with name '${createDto.name}' already exists`,
        );
      }

      // Create new attribute
      const attribute = new ProductAttribute();
      attribute.attribute_id = uuidv4();
      attribute.name = createDto.name;
      attribute.display_name = createDto.displayName;
      attribute.description = createDto.description;
      attribute.type = createDto.type;
      attribute.input_type = createDto.inputType;
      attribute.options = createDto.options;
      attribute.unit = createDto.unit;
      attribute.is_required = createDto.isRequired || false;
      attribute.is_variant_defining = createDto.isVariantDefining !== false;
      attribute.is_filterable = createDto.isFilterable !== false;
      attribute.is_searchable = createDto.isSearchable || false;
      attribute.sort_order = createDto.sortOrder || 0;
      attribute.group_name = createDto.groupName;
      attribute.help_text = createDto.helpText;
      attribute.default_value = createDto.defaultValue;

      const savedAttribute = await attributeRepo.save(attribute);

      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: '',
        action: 'CREATE_PRODUCT_ATTRIBUTE',
        targetTable: 'ProductAttribute',
        targetId: savedAttribute.attribute_id,
        metadata: {
          action: 'CREATE_PRODUCT_ATTRIBUTE',
          resource: 'ProductAttribute',
          resourceId: savedAttribute.attribute_id,
          changes: { created: savedAttribute },
        },
      });

      return this.transformAttributeToDto(savedAttribute);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create product attribute: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get all product attributes
   * @param storeId - Store ID
   * @returns List of attributes
   */
  async getAttributes(storeId: string): Promise<ProductAttributeResponseDto[]> {
    try {
      this.logger.debug(`Getting product attributes for store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const attributeRepo = dataSource.getRepository(ProductAttribute);

      const attributes = await attributeRepo.find({
        where: { is_deleted: false },
        order: { sort_order: 'ASC', display_name: 'ASC' },
      });

      return attributes.map((attr) => this.transformAttributeToDto(attr));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get product attributes: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Create a new product variant
   * @param storeId - Store ID
   * @param createDto - Variant creation data
   * @returns Created variant
   */
  async createVariant(
    storeId: string,
    createDto: CreateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    try {
      this.logger.log(
        `Creating product variant: ${createDto.sku} in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const variantRepo = dataSource.getRepository(ProductVariant);
      const productRepo = dataSource.getRepository(Product);
      const attributeRepo = dataSource.getRepository(ProductAttribute);
      const variantAttributeRepo = dataSource.getRepository(
        ProductVariantAttribute,
      );

      // Check if product exists
      const product = await productRepo.findOne({
        where: { product_id: createDto.productId, is_deleted: false },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createDto.productId} not found`,
        );
      }

      // Check if SKU already exists
      const existingVariant = await variantRepo.findOne({
        where: { sku: createDto.sku, is_deleted: false },
      });

      if (existingVariant) {
        throw new ConflictException(
          `Variant with SKU '${createDto.sku}' already exists`,
        );
      }

      // Create new variant
      const variant = new ProductVariant();
      variant.variant_id = uuidv4();
      variant.product_id = createDto.productId;
      variant.sku = createDto.sku;
      variant.name = createDto.name;
      variant.description = createDto.description;
      variant.price_retail = createDto.priceRetail;
      variant.price_wholesale = createDto.priceWholesale;
      variant.cost_price = createDto.costPrice;
      variant.barcode = createDto.barcode;
      variant.stock = createDto.stock;
      variant.min_stock_level = createDto.minStockLevel;
      variant.weight = createDto.weight;
      variant.weight_unit = createDto.weightUnit;
      variant.dimensions = createDto.dimensions;
      variant.images = createDto.images;
      variant.sort_order = createDto.sortOrder || 0;
      variant.is_default = createDto.isDefault || false;

      const savedVariant = await variantRepo.save(variant);

      // Create variant attributes
      for (const attrDto of createDto.attributes) {
        const attribute = await attributeRepo.findOne({
          where: { attribute_id: attrDto.attributeId, is_deleted: false },
        });

        if (!attribute) {
          throw new NotFoundException(
            `Attribute with ID ${attrDto.attributeId} not found`,
          );
        }

        const variantAttribute = new ProductVariantAttribute();
        variantAttribute.variant_attribute_id = uuidv4();
        variantAttribute.variant_id = savedVariant.variant_id;
        variantAttribute.attribute_id = attrDto.attributeId;
        variantAttribute.value = attrDto.value;
        variantAttribute.display_value = attrDto.displayValue;
        variantAttribute.sort_order = attrDto.sortOrder || 0;

        await variantAttributeRepo.save(variantAttribute);
      }

      // If this is set as default, unset other defaults
      if (variant.is_default) {
        await variantRepo.update(
          {
            product_id: createDto.productId,
            variant_id: { $ne: savedVariant.variant_id } as any,
          },
          { is_default: false },
        );
      }

      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: '',
        action: 'CREATE_PRODUCT_VARIANT',
        targetTable: 'ProductVariant',
        targetId: savedVariant.variant_id,
        metadata: {
          action: 'CREATE_PRODUCT_VARIANT',
          resource: 'ProductVariant',
          resourceId: savedVariant.variant_id,
          changes: { created: savedVariant },
        },
      });

      return this.getVariantById(storeId, savedVariant.variant_id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to create product variant: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get variant by ID
   * @param storeId - Store ID
   * @param variantId - Variant ID
   * @returns Variant details
   */
  async getVariantById(
    storeId: string,
    variantId: string,
  ): Promise<ProductVariantResponseDto> {
    try {
      this.logger.debug(`Getting variant: ${variantId} in store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const variantRepo = dataSource.getRepository(ProductVariant);

      const variant = await variantRepo.findOne({
        where: { variant_id: variantId, is_deleted: false },
        relations: ['attributes', 'attributes.attribute'],
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }

      return this.transformVariantToDto(variant);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get variant: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get product with all variants
   * @param storeId - Store ID
   * @param productId - Product ID
   * @returns Product with variants
   */
  async getProductWithVariants(
    storeId: string,
    productId: string,
  ): Promise<ProductWithVariantsResponseDto> {
    try {
      this.logger.debug(
        `Getting product with variants: ${productId} in store: ${storeId}`,
      );

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const productRepo = dataSource.getRepository(Product);
      const variantRepo = dataSource.getRepository(ProductVariant);
      const attributeRepo = dataSource.getRepository(ProductAttribute);

      // Get product
      const product = await productRepo.findOne({
        where: { product_id: productId, is_deleted: false },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // Get variants
      const variants = await variantRepo.find({
        where: { product_id: productId, is_deleted: false },
        relations: ['attributes', 'attributes.attribute'],
        order: { sort_order: 'ASC', created_at: 'ASC' },
      });

      // Get available attributes
      const availableAttributes = await attributeRepo.find({
        where: { is_deleted: false, is_active: true },
        order: { sort_order: 'ASC', display_name: 'ASC' },
      });

      // Calculate statistics
      const activeVariants = variants.filter((v) => v.is_active).length;
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const prices = variants.map((v) => v.price_retail);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      return {
        productId: product.product_id,
        productName: product.name,
        productDescription: product.description,
        variants: variants.map((v) => this.transformVariantToDto(v)),
        totalVariants: variants.length,
        activeVariants,
        totalStock,
        minPrice,
        maxPrice,
        availableAttributes: availableAttributes.map((attr) =>
          this.transformAttributeToDto(attr),
        ),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to get product with variants: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Update product variant
   * @param storeId - Store ID
   * @param variantId - Variant ID
   * @param updateDto - Update data
   * @returns Updated variant
   */
  async updateVariant(
    storeId: string,
    variantId: string,
    updateDto: UpdateProductVariantDto,
  ): Promise<ProductVariantResponseDto> {
    try {
      this.logger.log(`Updating variant: ${variantId} in store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const variantRepo = dataSource.getRepository(ProductVariant);
      const variantAttributeRepo = dataSource.getRepository(
        ProductVariantAttribute,
      );

      const variant = await variantRepo.findOne({
        where: { variant_id: variantId, is_deleted: false },
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }

      // Update variant fields
      if (updateDto.name !== undefined) variant.name = updateDto.name;
      if (updateDto.description !== undefined)
        variant.description = updateDto.description;
      if (updateDto.priceRetail !== undefined)
        variant.price_retail = updateDto.priceRetail;
      if (updateDto.priceWholesale !== undefined)
        variant.price_wholesale = updateDto.priceWholesale;
      if (updateDto.costPrice !== undefined)
        variant.cost_price = updateDto.costPrice;
      if (updateDto.barcode !== undefined) variant.barcode = updateDto.barcode;
      if (updateDto.stock !== undefined) variant.stock = updateDto.stock;
      if (updateDto.minStockLevel !== undefined)
        variant.min_stock_level = updateDto.minStockLevel;
      if (updateDto.weight !== undefined) variant.weight = updateDto.weight;
      if (updateDto.weightUnit !== undefined)
        variant.weight_unit = updateDto.weightUnit;
      if (updateDto.dimensions !== undefined)
        variant.dimensions = updateDto.dimensions;
      if (updateDto.images !== undefined) variant.images = updateDto.images;
      if (updateDto.sortOrder !== undefined)
        variant.sort_order = updateDto.sortOrder;
      if (updateDto.isDefault !== undefined)
        variant.is_default = updateDto.isDefault;
      if (updateDto.isActive !== undefined)
        variant.is_active = updateDto.isActive;

      const savedVariant = await variantRepo.save(variant);

      // Update attributes if provided
      if (updateDto.attributes) {
        // Remove existing attributes
        await variantAttributeRepo.delete({ variant_id: variantId });

        // Add new attributes
        for (const attrDto of updateDto.attributes) {
          const variantAttribute = new ProductVariantAttribute();
          variantAttribute.variant_attribute_id = uuidv4();
          variantAttribute.variant_id = variantId;
          variantAttribute.attribute_id = attrDto.attributeId;
          variantAttribute.value = attrDto.value;
          variantAttribute.display_value = attrDto.displayValue;
          variantAttribute.sort_order = attrDto.sortOrder || 0;

          await variantAttributeRepo.save(variantAttribute);
        }
      }

      // If this is set as default, unset other defaults
      if (updateDto.isDefault) {
        await variantRepo
          .createQueryBuilder()
          .update(ProductVariant)
          .set({ is_default: false })
          .where('product_id = :productId AND variant_id != :variantId', {
            productId: variant.product_id,
            variantId: variantId,
          })
          .execute();
      }

      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: '',
        action: 'UPDATE_PRODUCT_VARIANT',
        targetTable: 'ProductVariant',
        targetId: variantId,
        metadata: {
          action: 'UPDATE_PRODUCT_VARIANT',
          resource: 'ProductVariant',
          resourceId: variantId,
          changes: updateDto,
        },
      });

      return this.getVariantById(storeId, variantId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to update variant: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Delete product variant
   * @param storeId - Store ID
   * @param variantId - Variant ID
   */
  async deleteVariant(storeId: string, variantId: string): Promise<void> {
    try {
      this.logger.log(`Deleting variant: ${variantId} in store: ${storeId}`);

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const variantRepo = dataSource.getRepository(ProductVariant);

      const variant = await variantRepo.findOne({
        where: { variant_id: variantId, is_deleted: false },
      });

      if (!variant) {
        throw new NotFoundException(`Variant with ID ${variantId} not found`);
      }

      // Soft delete
      variant.is_deleted = true;
      await variantRepo.save(variant);

      // Audit log
      await this.auditLogsService.create(storeId, {
        userId: '',
        action: 'DELETE_PRODUCT_VARIANT',
        targetTable: 'ProductVariant',
        targetId: variantId,
        metadata: {
          action: 'DELETE_PRODUCT_VARIANT',
          resource: 'ProductVariant',
          resourceId: variantId,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to delete variant: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Transform ProductVariant entity to DTO
   * @param variant - ProductVariant entity
   * @returns ProductVariantResponseDto
   */
  private transformVariantToDto(
    variant: ProductVariant,
  ): ProductVariantResponseDto {
    return {
      variantId: variant.variant_id,
      productId: variant.product_id,
      sku: variant.sku,
      name: variant.name,
      description: variant.description,
      priceRetail: variant.price_retail,
      priceWholesale: variant.price_wholesale,
      costPrice: variant.cost_price,
      barcode: variant.barcode,
      stock: variant.stock,
      minStockLevel: variant.min_stock_level,
      weight: variant.weight,
      weightUnit: variant.weight_unit,
      dimensions: variant.dimensions,
      images: variant.images,
      sortOrder: variant.sort_order,
      isDefault: variant.is_default,
      isActive: variant.is_active,
      createdAt: variant.created_at,
      updatedAt: variant.updated_at,
      attributes:
        variant.attributes?.map((attr) => ({
          variantAttributeId: attr.variant_attribute_id,
          attributeId: attr.attribute_id,
          attribute: this.transformAttributeToDto(attr.attribute),
          value: attr.value,
          displayValue: attr.display_value,
          sortOrder: attr.sort_order,
        })) || [],
    };
  }

  /**
   * Transform ProductAttribute entity to DTO
   * @param attribute - ProductAttribute entity
   * @returns ProductAttributeResponseDto
   */
  private transformAttributeToDto(
    attribute: ProductAttribute,
  ): ProductAttributeResponseDto {
    return {
      attributeId: attribute.attribute_id,
      name: attribute.name,
      displayName: attribute.display_name,
      description: attribute.description,
      type: attribute.type,
      inputType: attribute.input_type,
      options: attribute.options,
      unit: attribute.unit,
      isRequired: attribute.is_required,
      isVariantDefining: attribute.is_variant_defining,
      isFilterable: attribute.is_filterable,
      isSearchable: attribute.is_searchable,
      sortOrder: attribute.sort_order,
      groupName: attribute.group_name,
      helpText: attribute.help_text,
      defaultValue: attribute.default_value,
      isActive: attribute.is_active,
      createdAt: attribute.created_at,
      updatedAt: attribute.updated_at,
    };
  }
}
