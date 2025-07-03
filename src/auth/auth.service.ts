import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateAuthDto } from './dto/login.dto';
import { Users } from '../users/entities/user.entity';
import{ } from 

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ===== SIGN IN =====
  async signIn(
    createAuthDto: CreateAuthDto,
  ): Promise<{

    accessToken: string;
    refreshToken: string;
  
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: createAuthDto.email },
    
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'hashedRefreshToken'],
      });

      if (!user) {
        this.logger.warn(`Login failed - user not found: ${createAuthDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare against 'user.password' which contains the hashed password
      const isPasswordValid = await bcrypt.compare(createAuthDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login failed - invalid password: ${createAuthDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const { accessToken, refreshToken, role } = await this.getTokens(
        user.id,
        user.email,
        user.role,
      );

      await this.updateRefreshToken(user.id, refreshToken);

      // Destructure password and hashedRefreshToken to remove sensitive data
      const { password, hashedRefreshToken, ...userWithoutSensitive } = user;

      this.logger.log(`User logged in successfully: ${user.email}`);

      return {
        
        accessToken,
        refreshToken,
        
      };
    } catch (error) {
      this.logger.error(`Sign in error: ${error.message}`);
      throw error;
    }
  }

  // ===== REFRESH TOKENS =====
  async refreshTokens(userId: number, refreshToken: string) {
    try {
      if (!refreshToken) {
        this.logger.error('No refresh token provided');
        throw new UnauthorizedException('No refresh token provided');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'role', 'hashedRefreshToken'],
      });

      if (!user || !user.hashedRefreshToken) {
        this.logger.warn(`Refresh failed - Invalid user or missing refresh token for ID: ${userId}`);
        throw new UnauthorizedException('Access Denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken
      );

      if (!refreshTokenMatches) {
        this.logger.warn(`Refresh failed - Token mismatch for user ID: ${userId}`);
        throw new UnauthorizedException('Access Denied');
      }

      const tokens = await this.getTokens(user.id, user.email, user.role);
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      this.logger.log(`Tokens refreshed successfully for user ID: ${userId}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        role: user.role
      };
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Unable to refresh tokens');
    }
  }

  // ===== VALIDATE TOKEN =====
  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      });
      return payload;
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ===== SIGN OUT =====
  async signOut(userId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        this.logger.warn(`Sign out failed - user not found: ID ${userId}`);
        throw new NotFoundException(`User not found: ${userId}`);
      }

      await this.userRepository.update(userId, { hashedRefreshToken: undefined });

      this.logger.log(`User signed out successfully: ID ${userId}`);

      return { message: 'Successfully signed out' };
    } catch (error) {
      this.logger.error(`Sign out error: ${error.message}`);
      throw error;
    }
  }

  // ===== GET TOKENS =====
  private async getTokens(
    userId: number,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string; role: string | undefined }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken, role };
  }

  // ===== UPDATE REFRESH TOKEN =====
  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    this.logger.log(`Updating hashed refresh token for user ID: ${userId}`);

    const result = await this.userRepository.update(userId, { hashedRefreshToken });
    if (result.affected === 0) {
      this.logger.warn(`Failed to update refresh token for user ID: ${userId}`);
    } else {
      this.logger.log(`Refresh token updated successfully for user ID: ${userId}`);
    }
  }

  async sendEmailResetOtp(body: { email: string }) {
    const email = body.email;
    const user = await this.usersService.findUserByEmail(email);
    console.log('user in auth service for refresh is', user);
    if (!user) {
      throw new NotFoundException(
        `User with email ${email} in sendEmailResetOtp not found`,
      );
    }
    const id = user.id;
    const { otp, secret } = this.generateOtp();

    await this.usersService.update(id, {
      otp,
      secret,
    });
    await this.mailService.sendPasswordResetEmail(user, otp, secret);
    return { otp, secret };
  }

  async resetPassword(body: ResetPasswordDto) {
    const email = body.email;
    const otp = body.otp;

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (!user.secret || !user.otp) {
      throw new BadRequestException('Missing OTP or secret');
    }

    console.log('user in resetPassword', {
      secret: user.secret,
      otp: otp,
    });

    const id = user.id;

    const isValidOtp = speakeasy.totp.verify({
      secret: user.secret,
      encoding: 'base32',
      token: otp!,
      step: 240,
      digits: 6,
      window: 0,
    });

    if (!isValidOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Add logic to actually reset the password
    if (body.password) {
      await this.usersService.update(id, {
        password: body.password,
        otp: '',
        secret: '',
      });

      return { message: 'Password reset successful' };
    } else {
      throw new BadRequestException('New password is required');
    }
  }
}

