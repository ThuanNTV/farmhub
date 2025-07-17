import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/auth/jwt-auth.guard';
import { RolesGuard } from 'src/core/rbac/role/roles.guard';
import { RateLimitGuard } from 'src/common/auth/rate-limit.guard';
import { Roles } from 'src/core/rbac/role/roles.decorator';
import { RateLimitAPI } from 'src/common/decorator/rate-limit.decorator';
import { AuditInterceptor } from 'src/common/auth/audit.interceptor';
import { UserRole } from 'src/modules/users/dto/create-user.dto';
import { CreateFileAttachmentDto } from 'src/modules/file-attachments/dto/create-fileAttachment.dto';
import { UpdateFileAttachmentDto } from 'src/modules/file-attachments/dto/update-fileAttachment.dto';
import { FileAttachmentResponseDto } from 'src/modules/file-attachments/dto/fileAttachment-response.dto';
import { FileAttachmentsService } from 'src/modules/file-attachments/service/file-attachments.service';

@ApiTags('File Attachments')
@ApiBearerAuth('access-token')
@Controller('tenant/:storeId/file-attachments')
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@UseInterceptors(AuditInterceptor)
export class FileAttachmentsController {
  constructor(private readonly service: FileAttachmentsService) {}

  @Post()
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new file attachment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 201,
    description: 'File attachment created successfully',
    type: FileAttachmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Param('storeId') storeId: string,
    @Body() dto: CreateFileAttachmentDto,
  ): Promise<FileAttachmentResponseDto> {
    return await this.service.createFileAttachment(storeId, dto);
  }

  @Get()
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get all file attachments' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiResponse({
    status: 200,
    description: 'File attachments retrieved successfully',
    type: [FileAttachmentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(
    @Param('storeId') storeId: string,
  ): Promise<FileAttachmentResponseDto[]> {
    return await this.service.findAllFileAttachments(storeId);
  }

  @Get(':id')
  @RateLimitAPI()
  @Roles(
    UserRole.ADMIN_GLOBAL,
    UserRole.ADMIN_STORE,
    UserRole.STORE_MANAGER,
    UserRole.STORE_STAFF,
  )
  @ApiOperation({ summary: 'Get file attachment by ID' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'File Attachment ID' })
  @ApiResponse({
    status: 200,
    description: 'File attachment retrieved successfully',
    type: FileAttachmentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File attachment not found' })
  async findById(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<FileAttachmentResponseDto> {
    return await this.service.findFileAttachment(storeId, id);
  }

  @Patch(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE, UserRole.STORE_MANAGER)
  @ApiOperation({ summary: 'Update file attachment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'File Attachment ID' })
  @ApiResponse({
    status: 200,
    description: 'File attachment updated successfully',
    type: FileAttachmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File attachment not found' })
  async update(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
    @Body() dto: UpdateFileAttachmentDto,
  ): Promise<FileAttachmentResponseDto> {
    return await this.service.updateFileAttachment(storeId, id, dto);
  }

  @Delete(':id')
  @RateLimitAPI()
  @Roles(UserRole.ADMIN_GLOBAL, UserRole.ADMIN_STORE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete file attachment' })
  @ApiParam({ name: 'storeId', description: 'Store ID' })
  @ApiParam({ name: 'id', description: 'File Attachment ID' })
  @ApiResponse({
    status: 204,
    description: 'File attachment deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File attachment not found' })
  async remove(
    @Param('storeId') storeId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.service.removeFileAttachment(storeId, id);
  }
}
