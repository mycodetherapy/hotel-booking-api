import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SupportRequestEmployeeService } from '../support-request-employee.service';
import { SupportRequest } from '../../schemas/support-request.schema';
import { MarkMessagesAsReadDto } from '../../interfaces/support.interfaces';

describe('SupportRequestEmployeeService', () => {
  let service: SupportRequestEmployeeService;
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
        author: new Types.ObjectId('507f1f77bcf86cd799439012'),
        text: 'Test message 2',
        createdAt: new Date(Date.now() - 5000),
        readAt: null,
      },
      {
        _id: new Types.ObjectId(),
        author: new Types.ObjectId('507f1f77bcf86cd799439011'),
        text: 'Test message 3',
        createdAt: new Date(),
        readAt: new Date(),
      },
    ],
  };

  const mockModel = {
    findById: jest.fn().mockReturnThis(),
    updateOne: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportRequestEmployeeService,
        {
          provide: getModelToken(SupportRequest.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<SupportRequestEmployeeService>(SupportRequestEmployeeService);
    model = module.get(getModelToken(SupportRequest.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('markMessagesAsRead', () => {
    it('should mark user messages as read', async () => {
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
            'm.author': { $eq: new Types.ObjectId(params.user) },
          }],
        },
      );
      expect(model.exec).toHaveBeenCalled();
    });
  });
});