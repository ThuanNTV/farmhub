import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { TenantDataSourceService } from 'src/config/db/dbtenant/tenant-datasource.service';
import { FileAttachment } from 'src/entities/tenant/file_attachment.entity';
import { CreateFileAttachmentDto } from 'src/modules/file-attachments/dto/create-fileAttachment.dto';
import { UpdateFileAttachmentDto } from 'src/modules/file-attachments/dto/update-fileAttachment.dto';
import { TenantBaseService } from 'src/service/tenant/tenant-base.service';
import { DtoMapper } from 'src/common/helpers/dto-mapper.helper';
import { FileAttachmentResponseDto } from 'src/modules/file-attachments/dto/fileAttachment-response.dto';

@Injectable()
export class FileAttachmentsService extends TenantBaseService<FileAttachment> {
  protected readonly logger = new Logger(FileAttachmentsService.name);
  protected primaryKey!: string;

  constructor(tenantDS: TenantDataSourceService) {
    super(tenantDS, FileAttachment);
    this.primaryKey = 'id';
  }

  async createFileAttachment(
    storeId: string,
    dto: CreateFileAttachmentDto,
  ): Promise<FileAttachmentResponseDto> {
    try {
      this.logger.log(`Creating file attachment for store: ${storeId}`);

      // Validate file URL format
      if (!this.isValidFileUrl(dto.fileUrl)) {
        throw new BadRequestException('Invalid file URL format');
      }

      const entityData = DtoMapper.mapToEntity<FileAttachment>(
        dto as unknown as Record<string, unknown>,
      );

      const created = await super.create(storeId, entityData);

      this.logger.log(`File attachment created successfully: ${created.id}`);

      return this.mapToResponseDto(created);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to create file attachment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findFileAttachmentById(
    storeId: string,
    id: string,
  ): Promise<FileAttachmentResponseDto | null> {
    try {
      this.logger.debug(
        `Finding file attachment by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        this.logger.warn(`File attachment not found: ${id}`);
        return null;
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find file attachment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findFileAttachment(
    storeId: string,
    id: string,
  ): Promise<FileAttachmentResponseDto> {
    try {
      this.logger.debug(
        `Finding file attachment by ID: ${id} in store: ${storeId}`,
      );

      const entity = await super.findById(storeId, id);

      if (!entity) {
        throw new NotFoundException(
          `File attachment with ID "${id}" not found`,
        );
      }

      return this.mapToResponseDto(entity);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find file attachment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async findAllFileAttachments(
    storeId: string,
  ): Promise<FileAttachmentResponseDto[]> {
    try {
      this.logger.debug(`Finding all file attachments for store: ${storeId}`);

      const repo = await this.getRepo(storeId);
      const entities = await repo.find({
        where: { is_deleted: false },
        relations: ['created_by_user', 'updated_by_user'],
        order: { created_at: 'DESC' },
      });

      this.logger.debug(`Found ${entities.length} file attachments`);

      return entities.map((entity) => this.mapToResponseDto(entity));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to find file attachments: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async updateFileAttachment(
    storeId: string,
    id: string,
    dto: UpdateFileAttachmentDto,
  ): Promise<FileAttachmentResponseDto> {
    try {
      this.logger.log(`Updating file attachment: ${id} in store: ${storeId}`);

      const repo = await this.getRepo(storeId);

      // Validate file URL if provided
      if (dto.fileUrl && !this.isValidFileUrl(dto.fileUrl)) {
        throw new BadRequestException('Invalid file URL format');
      }

      const entityData = DtoMapper.mapToEntity<FileAttachment>(
        dto as unknown as Record<string, unknown>,
      );

      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(
          `File attachment with ID "${id}" not found`,
        );
      }
      const updated = repo.merge(entity, entityData);
      const saved = await repo.save(updated);

      this.logger.log(`File attachment updated successfully: ${id}`);

      return this.mapToResponseDto(saved);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to update file attachment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async removeFileAttachment(storeId: string, id: string): Promise<void> {
    try {
      this.logger.log(`Removing file attachment: ${id} from store: ${storeId}`);

      const repo = await this.getRepo(storeId);

      // Soft delete instead of hard delete
      const entity = await super.findById(storeId, id);
      if (!entity) {
        throw new NotFoundException(
          `File attachment with ID "${id}" not found`,
        );
      }
      entity.is_deleted = true;
      await repo.save(entity);

      this.logger.log(`File attachment soft deleted successfully: ${id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to remove file attachment: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Validate file URL format
   */
  private isValidFileUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(entity: FileAttachment): FileAttachmentResponseDto {
    return {
      id: entity.id,
      entityType: entity.entity_type,
      entityId: entity.entity_id,
      fileUrl: entity.file_url,
      uploadedByUserId: entity.uploaded_by_user_id,
      note: entity.note,
      isDeleted: entity.is_deleted,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
      createdByUserId: entity.created_by_user_id,
      updatedByUserId: entity.updated_by_user_id,
    };
  }
}
