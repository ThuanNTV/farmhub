import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { Category } from 'src/entities/tenant/category.entity';

@ValidatorConstraint({ name: 'CategoryExists', async: true })
@Injectable()
export class CategoryExistsConstraint implements ValidatorConstraintInterface {
  constructor(
    private readonly tenantDataSourceService: TenantDataSourceService,
  ) {}

  async validate(
    categoryId: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    if (!categoryId) return true; // Let @IsNotEmpty handle empty values

    try {
      // Get storeId from context hoặc từ request
      const storeId = this.getStoreIdFromContext(args);
      if (!storeId) return false;

      const dataSource =
        await this.tenantDataSourceService.getTenantDataSource(storeId);
      const categoryRepo = dataSource.getRepository(Category);

      const category = await categoryRepo.findOne({
        where: {
          category_id: categoryId,
          is_deleted: false,
          is_active: true,
        },
      });

      return !!category;
    } catch (error) {
      console.error('Error validating category existence:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `Danh mục với ID "${args.value}" không tồn tại trong hệ thống`;
  }

  private getStoreIdFromContext(args: ValidationArguments): string | null {
    // Try to get storeId from validation context
    // This might need to be adjusted based on how you pass context
    const context = args.object as any;
    return context.storeId || context._storeId || null;
  }
}

export function CategoryExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: CategoryExistsConstraint,
    });
  };
}
