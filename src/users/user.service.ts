import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { IUserService } from './interfaces/user-service.interface';
import { SearchUserParams } from './interfaces/search-user-params.interface';

@Injectable()
export class UsersService implements IUserService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {
  }

  async create(data: Partial<User & { password?: string }>): Promise<User> {
    const password = data.password || data.passwordHash;
    if (!password) {
      throw new Error('Password is required');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new this.UserModel({
      ...data,
      passwordHash: hashedPassword,
    });
    return user.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.UserModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.UserModel.findOne({ email }).exec();
  }

  async findAll(params: SearchUserParams): Promise<User[]> {
    const { limit, offset, email, name, contactPhone } = params;
    const query: any = {};

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (contactPhone) {
      query.contactPhone = { $regex: contactPhone, $options: 'i' };
    }

    return this.UserModel.find(query)
      .skip(offset)
      .limit(limit)
      .select('-passwordHash')
      .exec();
  }
}