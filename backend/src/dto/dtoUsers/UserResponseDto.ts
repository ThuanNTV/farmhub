import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose() userId!: string;
  @Expose() userName!: string;
  @Expose() fullName!: string;
  @Expose() email!: string;
  @Expose() phone?: string;
  @Expose() role!: string;
  @Expose() associatedStoreIds?: string[];
  @Expose() isActive!: boolean;
  @Expose() isSuperadmin!: boolean;
  @Expose() lastLoginAt?: Date;
  @Expose() createdAt?: Date;
  @Expose() updatedAt?: Date;

  @Exclude() passwordHash!: string;
  @Exclude() passwordResetToken?: string;
  @Exclude() tokenExpiryAt?: Date;
  @Exclude() isDeleted!: boolean;
}
