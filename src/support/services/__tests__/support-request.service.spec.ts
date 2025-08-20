import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { SupportRequestService } from '../support-request.service';
import { SupportRequest } from '../../schemas/support-request.schema';
import { SendMessageDto } from '../../interfaces/support.interfaces';


describe('SupportRequestService', () => {
  let service: SupportRequestService;
  let model: any;
  let eventEmitter: EventEmitter2;

  const mockSupportRequest = {
    _id: new Types.ObjectId(),
    user: new Types.ObjectId(),
    createdAt: new Date(),
    isActive: true,
    messages: [],
    save: jest.fn().mockResolvedValue(this),
  };

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    lean: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportRequestService,
        {
          provide: getModelToken(SupportRequest.name),
          useValue: mockModel,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<SupportRequestService>(SupportRequestService);
    model = module.get(getModelToken(SupportRequest.name));
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should send message and emit event', async () => {
      // Arrange
      const data: SendMessageDto = {
        supportRequest: 'test-id',
        author: '507f1f77bcf86cd799439011', // Valid ObjectId string
        text: 'Test message',
      };

      const mockSr = {
        ...mockSupportRequest,
        messages: [],
        save: jest.fn().mockResolvedValue({
          ...mockSupportRequest,
          messages: [{
            _id: new Types.ObjectId(),
            author: new Types.ObjectId(data.author),
            text: data.text,
            createdAt: new Date(),
            readAt: null,
          }],
        }),
      };

      jest.spyOn(service, 'getByIdOrFail').mockResolvedValue(mockSr as any);

      const result = await service.sendMessage(data);

      expect(result).toHaveProperty('text', data.text);
      expect(mockSr.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('supportRequest.newMessage', {
        supportRequest: mockSr,
        message: expect.any(Object),
      });
    });
  });

  describe('getMessages', () => {
    it('should return sorted messages by createdAt in ascending order', async () => {
      const supportRequestId = 'test-id';

      const message1 = {
        _id: new Types.ObjectId('5f8d0d55b54764421b7156c1'),
        createdAt: new Date('2023-01-02T00:00:00Z'),
        text: 'Message 2',
      };

      const message2 = {
        _id: new Types.ObjectId('5f8d0d55b54764421b7156c2'),
        createdAt: new Date('2023-01-01T00:00:00Z'),
        text: 'Message 1',
      };

      const mockSr = {
        messages: [message1, message2],
      };

      jest.spyOn(service, 'getByIdOrFail').mockResolvedValue(mockSr as any);

      const result = await service.getMessages(supportRequestId);

      expect(result[0]._id.toString()).toBe('5f8d0d55b54764421b7156c2');
      expect(result[0].text).toBe('Message 1');
      expect(result[1]._id.toString()).toBe('5f8d0d55b54764421b7156c1');
      expect(result[1].text).toBe('Message 2');
    });
  });
});