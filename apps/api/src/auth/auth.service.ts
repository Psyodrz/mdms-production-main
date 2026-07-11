import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@mdms/types';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

/**
 * Authentication Service
 * ======================
 * Handles: Email OTP, Email+Password, TOTP MFA, Google OAuth, JWT tokens.
 * Reference: SRS Section 15 — Security & Compliance
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Role-specific session TTLs (Section 4)
  private readonly SESSION_TTLS: Record<string, number> = {
    CLIENT: 7 * 24 * 3600,         // 7 days
    TALENT: 30 * 24 * 3600,        // 30 days
    EDITOR: 8 * 3600,              // 8 hours
    EMPLOYEE: 12 * 3600,           // 12 hours
    PROJECT_MANAGER: 24 * 3600,    // 24 hours
    ADMIN: 24 * 3600,              // 24 hours
    SUPER_ADMIN: 8 * 3600,         // 8 hours
  };

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  // ── Email OTP Flow (Client + Talent) ────────

  async sendOtp(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If this email is registered, an OTP has been sent.' };
    }

    // Check rate limiting
    const attempts = await this.redisService.incrementLoginAttempts(email);
    if (attempts > 5) {
      throw new ForbiddenException('Too many attempts. Please wait 15 minutes.');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redisService.setOtp(email, otp, 300); // 5 min TTL

    // TODO: Send via email (Nodemailer/SES) and WhatsApp

    return { message: 'If this email is registered, an OTP has been sent.' };
  }

  async verifyOtp(email: string, otp: string) {
    const storedOtp = await this.redisService.getOtp(email);
    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { client: true, talentProfile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account not found or deactivated');
    }

    // Clear OTP and login attempts
    await this.redisService.deleteOtp(email);
    await this.redisService.resetLoginAttempts(email);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginAttempts: 0, lockedUntil: null },
    });

    return this.generateTokens(user);
  }

  // ── Email + Password Flow (Employee, PM) ────

  async loginWithPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException('Account locked. Try again later.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Increment failed attempts
      const attempts = user.loginAttempts + 1;
      const updateData: Record<string, unknown> = { loginAttempts: attempts };

      if (attempts >= 10) {
        updateData.isActive = false; // Suspend after 10 attempts
      } else if (attempts >= 5) {
        updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account suspended. Contact admin.');
    }

    // Check if MFA is required
    const mfaRoles: Role[] = [Role.EDITOR, Role.ADMIN, Role.SUPER_ADMIN];
    if (mfaRoles.includes(user.role as Role) && user.mfaEnabled) {
      // Return partial token for MFA step
      const mfaToken = this.jwtService.sign(
        { sub: user.id, mfaPending: true },
        { expiresIn: '5m' },
      );
      return {
        mfaRequired: true,
        mfaToken,
        message: 'Please provide your TOTP code',
      };
    }

    // Reset failed attempts
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginAttempts: 0, lockedUntil: null },
    });

    return this.generateTokens(user);
  }

  // ── TOTP MFA Verification ──────────────────

  async verifyMfa(mfaToken: string, totpCode: string) {
    let payload: { sub: string; mfaPending: boolean };
    try {
      payload = this.jwtService.verify(mfaToken);
    } catch {
      throw new UnauthorizedException('MFA session expired');
    }

    if (!payload.mfaPending) {
      throw new UnauthorizedException('Invalid MFA token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not configured');
    }

    const isValid = authenticator.verify({
      token: totpCode,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), loginAttempts: 0, lockedUntil: null },
    });

    return this.generateTokens(user);
  }

  // ── MFA Setup ──────────────────────────────

  async setupMfa(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'MDMS', secret);

    // Store secret (not yet enabled)
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret },
    });

    return { secret, otpauthUrl };
  }

  async enableMfa(userId: string, totpCode: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('MFA not set up');
    }

    const isValid = authenticator.verify({
      token: totpCode,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid TOTP code. MFA not enabled.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { message: 'MFA enabled successfully' };
  }

  // ── Token Management ───────────────────────

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const ttl = this.SESSION_TTLS[user.role] || 7 * 24 * 3600;
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: `${ttl}s`,
    });

    // Store session in DB
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    const { passwordHash, mfaSecret, ...safeUser } = user;

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: safeUser,
    };
  }

  async refreshTokens(refreshToken: string) {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

    let payload: { sub: string; email: string; role: Role };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check session exists in DB
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await this.prisma.session.delete({ where: { id: session.id } });
      }
      throw new UnauthorizedException('Session expired');
    }

    // Delete old session
    await this.prisma.session.delete({ where: { id: session.id } });

    // Get fresh user data
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account not found or deactivated');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      // Logout specific session
      await this.prisma.session.deleteMany({
        where: { userId, refreshToken },
      });
    } else {
      // Logout all sessions
      await this.prisma.session.deleteMany({ where: { userId } });
    }

    return { message: 'Logged out successfully' };
  }

  // ── User Registration ──────────────────────

  async registerClient(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: Role.CLIENT,
        client: {
          create: {},
        },
      },
      include: { client: true },
    });

    return this.generateTokens(user);
  }

  async registerUser(data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: Role;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    let passwordHash = null;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        ...(data.role === Role.TALENT && { talentProfile: { create: { slug: `${data.firstName.toLowerCase()}-${Date.now()}` } } }),
      },
    });

    return this.generateTokens(user);
  }

  // ── Helper: Validate user by ID ────────────

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { client: true, talentProfile: true, employee: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return user;
  }
}
