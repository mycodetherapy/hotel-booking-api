import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SupportRequestClientService } from '../support-request-client.service';
import { SupportRequest } from '../../schemas/support-request.schema';
import { CreateSupportRequestDto, MarkMessagesAsReadDto } from '../../interfaces/support.interfaces';

describe('SupportRequestClientService', () => {
  let service: SupportRequestClientService;
  let model: any;

  const mockSupportRequest = {
    _id: new Types.ObjectId(),
    user: new Types.ObjectId('507f1f77bcf86cd799439011'),
    createdAt: new Date(),
    isActive: true,
    messages: [
      {
        _id: new Types.ObjectId(),
        author: new Types.ObjectId('507f1f77bcf86cd799439011'),
        text: 'Test message 1',
        createdAt: new Date(Date.now() - 10000),
        readAt: null,
      },
      {
        _id: new Types.ObjectId(),
        author: new Types.ObjectId('507f1f77bcf86cd799439012'), // Employee
        text: 'Test message 2',
        createdAt: new Date(Date.now() - 5000),
        readAt: null,
      },
      {
        _id: new Types.ObjectId(),
        author: new Types.ObjectId('507f1f77bcf86cd799439012'), // Employee
        text: 'Test message 3',
        createdAt: new Date(),
        readAt: new Date(),
      },
    ],
  };

  const mockModel = {
    findById: jest.fn().mockReturnThis(),
    create: jest.fn(),
    updateOne: jest.fn().mockReturnThis(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportRequestClientService,
        {
          provide: getModelToken(SupportRequest.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<SupportRequestClientService>(SupportRequestClientService);
    model = module.get(getModelToken(SupportRequest.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnreadCount', () => {
    it('should return count of unread messages from employees', async () => {
      const supportRequestId = 'test-id';
      model.lean.mockResolvedValue(mockSupportRequest);

      const result = await service.getUnreadCount(supportRequestId);

      expect(result).toBe(1);
      expect(model.findById).toHaveBeenCalledWith(supportRequestId);
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark employee messages as read', async () => {
      const params: MarkMessagesAsReadDto = {
        supportRequest: 'test-id',
        user: '507f1f77bcf86cd799439011',
        createdBefore: new Date(),
      };

      model.lean.mockResolvedValue(mockSupportRequest);
      model.exec.mockResolvedValue({} as any);

      await service.markMessagesAsRead(params);

      expect(model.findById).toHaveBeenCalledWith(params.supportRequest, 'user');
      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: params.supportRequest },
        {
          $set: {
            'messages.$[m].readAt': expect.any(Date),
          },
        },
        {
          arrayFilters: [{
            'm.readAt': null,
            'm.createdAt': { $lte: expect.any(Date) },
            'm.author': { $ne: new Types.ObjectId(params.user) },
          }],
        },
      );
      expect(model.exec).toHaveBeenCalled();
    });
  });

  describe('createSupportRequest', () => {
    it('should create a new support request', async () => {
      const data: CreateSupportRequestDto = {
        user: '507f1f77bcf86cd799439011',
        text: 'Help me please',
      };
      
      model.create.mockResolvedValue(mockSupportRequest);

      const result = await service.createSupportRequest(data);

      expect(model.create).toHaveBeenCalledWith({
        user: new Types.ObjectId(data.user),
        createdAt: expect.any(Date),
        isActive: true,
        messages: [
          {
            _id: expect.any(Types.ObjectId),
            author: new Types.ObjectId(data.user),
            text: data.text,
            createdAt: expect.any(Date),
            readAt: null,
          },
        ],
      });
      expect(result).toBe(mockSupportRequest);
    });
  });
});