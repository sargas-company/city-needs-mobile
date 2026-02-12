---------
Imports
---------
```
// src/modules/analytics/analytics.controller.ts
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { DbUserAuthGuard } from 'src/common/guards/db-user-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { successResponse } from 'src/common/utils/response.util';

import { AnalyticsService } from './analytics.service';
import {
  SwaggerAnalyticsCreateEvent,
  SwaggerAnalyticsGetActivity,
  SwaggerAnalyticsGetProfileViews,
  SwaggerAnalyticsGetSummary,
  SwaggerAnalyticsGetUserActions,
} from './analytics.swagger';
import { CreateAnalyticsEventDto } from './dto/create-analytics-event.dto';

@UseGuards(DbUserAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('event')
  @Roles(UserRole.END_USER)
  @SwaggerAnalyticsCreateEvent()
  async createEvent(@CurrentUser() user: User, @Body() dto: CreateAnalyticsEventDto) {
    await this.analyticsService.createEvent(user.id, dto);

    return successResponse({ success: true }, 201);
  }

  @Get('summary')
  @Roles(UserRole.BUSINESS_OWNER)
  @SwaggerAnalyticsGetSummary()
  async getSummary(@CurrentUser() user: User) {
    const summary = await this.analyticsService.getSummary(user.id);

    return successResponse(summary);
  }

  @Get('activity')
  @Roles(UserRole.BUSINESS_OWNER)
  @SwaggerAnalyticsGetActivity()
  async getActivity(@CurrentUser() user: User) {
    const activity = await this.analyticsService.getActivity(user.id);

    return successResponse(activity);
  }

  @Get('profile-views')
  @Roles(UserRole.BUSINESS_OWNER)
  @SwaggerAnalyticsGetProfileViews()
  async getProfileViews(@CurrentUser() user: User) {
    const profileViews = await this.analyticsService.getProfileViews(user.id);

    return successResponse(profileViews);
  }

  @Get('user-actions')
  @Roles(UserRole.BUSINESS_OWNER)
  @SwaggerAnalyticsGetUserActions()
  async getUserActions(@CurrentUser() user: User) {
    const userActions = await this.analyticsService.getUserActions(user.id);

    return successResponse(userActions);
  }
}

```

----------
VALIDATOR
----------

```import { AnalyticsEventType } from '@prisma/client';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'AnalyticsEventValidator', async: false })
export class AnalyticsEventValidator implements ValidatorConstraintInterface {
  validate(_: any, args: ValidationArguments): boolean {
    const dto = args.object as any;

    if (dto.type === AnalyticsEventType.USER_ACTION) {
      return dto.actionType !== undefined && dto.actionType !== null;
    }

    if (dto.type === AnalyticsEventType.PROFILE_VIEW) {
      return dto.actionType === undefined || dto.actionType === null;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const dto = args.object as any;

    if (dto.type === AnalyticsEventType.USER_ACTION) {
      return 'actionType is required when type is USER_ACTION';
    }

    if (dto.type === AnalyticsEventType.PROFILE_VIEW) {
      return 'actionType must not be provided when type is PROFILE_VIEW';
    }

    return 'Invalid analytics event';
  }
}
```
--------------
DTO
--------------
```
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnalyticsActionType, AnalyticsEventType, AnalyticsSource } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';

import { AnalyticsEventValidator } from '../validators/analytics-event.validator';

export class CreateAnalyticsEventDto {
  @ApiProperty({
    description: 'Business ID',
    example: 'business-uuid',
  })
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @ApiProperty({
    enum: AnalyticsEventType,
    description: 'Type of analytics event',
    example: AnalyticsEventType.PROFILE_VIEW,
  })
  @IsEnum(AnalyticsEventType)
  @Validate(AnalyticsEventValidator)
  type!: AnalyticsEventType;

  @ApiProperty({
    enum: AnalyticsSource,
    description: 'Source of the event',
    example: AnalyticsSource.SEARCH,
  })
  @IsEnum(AnalyticsSource)
  source!: AnalyticsSource;

  @ApiPropertyOptional({
    enum: AnalyticsActionType,
    description: 'Required for USER_ACTION, forbidden for PROFILE_VIEW',
    example: AnalyticsActionType.CALL,
  })
  @IsOptional()
  @IsEnum(AnalyticsActionType)
  actionType?: AnalyticsActionType;
}

```
```
// src/modules/analytics/dto/analytics-activity-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ActivityMonthDto {
  @ApiProperty({
    description: 'Short month name',
    example: 'Jan',
  })
  label!: string;

  @ApiProperty({
    description: 'Profile views count for the month',
    example: 150,
  })
  views!: number;

  @ApiProperty({
    description: 'User actions count for the month',
    example: 45,
  })
  actions!: number;
}

export class AnalyticsActivityResponseDto {
  @ApiProperty({
    description: 'Monthly activity data for the last 6 months',
    type: [ActivityMonthDto],
  })
  data!: ActivityMonthDto[];
}

```
```// src/modules/analytics/dto/analytics-profile-views-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { AnalyticsSource } from '@prisma/client';

export class TimelineItemDto {
  @ApiProperty({
    description: 'Short month name',
    example: 'Jan',
  })
  label!: string;

  @ApiProperty({
    description: 'Profile views count for the month',
    example: 150,
  })
  value!: number;
}

export class SourceDistributionDto {
  @ApiProperty({
    enum: AnalyticsSource,
    description: 'Source of the view',
    example: AnalyticsSource.SEARCH,
  })
  source!: AnalyticsSource;

  @ApiProperty({
    description: 'Percentage of views from this source (rounded to integer)',
    example: 45,
  })
  percent!: number;
}

export class AnalyticsProfileViewsResponseDto {
  @ApiProperty({
    description: 'Total profile views for current month',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Percentage change compared to previous month',
    example: 25.5,
  })
  deltaPercent!: number;

  @ApiProperty({
    description: 'Profile views timeline for last 6 months',
    type: [TimelineItemDto],
  })
  timeline!: TimelineItemDto[];

  @ApiProperty({
    description: 'Distribution of views by source for current month',
    type: [SourceDistributionDto],
  })
  sources!: SourceDistributionDto[];
}
```
```// src/modules/analytics/dto/analytics-summary-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MetricDto {
  @ApiProperty({
    description: 'Total count for current month',
    example: 150,
  })
  total!: number;

  @ApiProperty({
    description: 'Percentage change compared to previous month',
    example: 25.5,
  })
  deltaPercent!: number;
}

export class AnalyticsSummaryResponseDto {
  @ApiProperty({
    description: 'Profile views statistics',
    type: MetricDto,
  })
  profileViews!: MetricDto;

  @ApiProperty({
    description: 'User actions statistics',
    type: MetricDto,
  })
  userActions!: MetricDto;
}
```
```
// src/modules/analytics/dto/analytics-user-actions-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { AnalyticsActionType } from '@prisma/client';

export class TimelineItemDto {
  @ApiProperty({
    description: 'Short month name',
    example: 'Jan',
  })
  label!: string;

  @ApiProperty({
    description: 'User actions count for the month',
    example: 45,
  })
  value!: number;
}

export class InteractionDistributionDto {
  @ApiProperty({
    enum: AnalyticsActionType,
    description: 'Type of interaction',
    example: AnalyticsActionType.CALL,
  })
  type!: AnalyticsActionType;

  @ApiProperty({
    description: 'Percentage of actions of this type (rounded to integer)',
    example: 35,
  })
  percent!: number;
}

export class AnalyticsUserActionsResponseDto {
  @ApiProperty({
    description: 'Total user actions for current month',
    example: 45,
  })
  total!: number;

  @ApiProperty({
    description: 'Percentage change compared to previous month',
    example: -10.2,
  })
  deltaPercent!: number;

  @ApiProperty({
    description: 'User actions timeline for last 6 months',
    type: [TimelineItemDto],
  })
  timeline!: TimelineItemDto[];

  @ApiProperty({
    description: 'Distribution of actions by type for current month',
    type: [InteractionDistributionDto],
  })
  interactions!: InteractionDistributionDto[];
}
```
