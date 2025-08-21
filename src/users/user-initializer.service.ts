import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './user.service';
import { adminConfig } from './config/admin.config';

@Injectable()
export class AdminInitializerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminInitializerService.name);

  constructor(private readonly usersService: UsersService) {
  }

  async onApplicationBootstrap() {
    await this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    try {
      const { email, password, name, phone } = adminConfig;

      const existingAdmin = await this.usersService.findByEmail(email);

      if (!existingAdmin) {
        const adminUser = await this.usersService.create({
          email,
          password,
          name,
          contactPhone: phone,
          role: 'admin',
        });

        this.logger.log('==========================================');
        this.logger.log('ADMIN USER CREATED SUCCESSFULLY');
        this.logger.log(`Email: ${adminUser.email}`);
        this.logger.log(`Password: ${password}`);
        this.logger.log('==========================================');

      } else {
        this.logger.log(`Admin user already exists: ${email}`);
      }
    } catch (error) {
      this.logger.error('Failed to initialize admin user:', error.message);

      if (error.code !== 11000) {
        this.logger.error('Stack trace:', error.stack);
      }
    }
  }
}