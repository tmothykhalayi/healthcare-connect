import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Param,
  ParseIntPipe,
  Headers,
  Logger,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from './decorators/public.decorator';
import { GetCurrentUserId } from './decorators/get-current-user-id.decorator';
import { AtGuard, RtGuard } from './guards';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // ===== SIGN IN =====
  @Public()
  @Post('signin')
  @ApiOperation({ summary: 'Sign in user' })
  async signIn(@Body() createAuthDto: CreateAuthDto) {
    const result = await this.authService.signIn(createAuthDto);

    // Check if we have the required user data
    // if (!result.user?.id || !result.user?.email) {
    //   throw new UnauthorizedException('Invalid user data returned from authentication');
    // }

    // Remove the welcome email logic or replace with an existing method
    // If you still want to send a welcome email, implement the method in UsersService
    
    return result;
  }

  // ===== SIGN OUT =====
  @UseGuards(AtGuard)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed out',
    schema: {
      example: {
        message: 'Successfully signed out'
      },
    },
  })
  async signOut(@GetCurrentUserId() userId: number) {
    await this.authService.signOut(userId);
    return { message: 'Successfully signed out' };
  }

  // ===== REFRESH TOKENS =====
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens generated',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1...',
        refreshToken: 'eyJhbGciOiJIUzI1...',
        role: 'USER',
      },
    },
  })
  async refreshTokens(
    @Req() req: any,
    @Headers('authorization') authHeader: string
  ) {
    const userId = req.user?.sub;
    const refreshToken = authHeader?.replace('Bearer', '').trim();

    if (!userId || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.authService.refreshTokens(userId, refreshToken);
  }

  // ===== GET PROFILE =====
  @UseGuards(AtGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        role: 'patient',
        firstName: 'John',
        lastName: 'Doe'
      },
    },
  })
  async getProfile(@GetCurrentUserId() userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    // Return user profile without sensitive data
    const { password, hashedRefreshToken, ...profile } = user;
    return profile;
  }
}
