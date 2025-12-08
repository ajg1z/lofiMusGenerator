import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(name: string, email: string, password: string): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [{ name }, { email }],
    });

    if (existingUser) {
      if (existingUser.name === name) {
        throw new ConflictException('User with this name already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByName(name: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { name } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async validateUser(name: string, password: string): Promise<User | null> {
    const user = await this.findByName(name);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
