import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reservation } from './schemas/reservation.schema';
import { HotelRoomsService } from '../hotels/hotel-rooms.service';
import { ID } from '../types';
import { ReservationResponseDto } from './dto/reservation-response.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<Reservation>,
    private hotelRoomsService: HotelRoomsService,
  ) {
  }

  async addReservation(userId: ID, roomId: ID, startDate: Date, endDate: Date): Promise<ReservationResponseDto> {
    const room = await this.hotelRoomsService.findById(roomId.toString());
    if (!room || !room.isEnabled) {
      throw new BadRequestException('Room not found or disabled');
    }

    const isAvailable = await this.isRoomAvailable(roomId, startDate, endDate);
    if (!isAvailable) {
      throw new ConflictException('Room is already booked for these dates');
    }

    const reservation = new this.reservationModel({
      userId,
      hotelId: room.hotel._id,
      roomId,
      dateStart: startDate,
      dateEnd: endDate,
    });

    const saved = await reservation.save();

    const populated = await this.reservationModel
      .findById(saved._id)
      .populate([
        { path: 'roomId', select: 'description images' },
        { path: 'hotelId', select: 'title description' },
      ])
      .lean();

    if (!populated) {
      throw new NotFoundException('Reservation not found after saving');
    }

    const response: ReservationResponseDto = {
      startDate: populated.dateStart,
      endDate: populated.dateEnd,
      hotelRoom: {
        description: (populated.roomId as any)?.description,
        images: (populated.roomId as any)?.images,
      },
      hotel: {
        title: (populated.hotelId as any)?.title,
        description: (populated.hotelId as any)?.description,
      },
    };

    return response;
  }

  async getReservations(userId: ID) {
    const id = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const reservations = await this.reservationModel
      .find({ userId: id })
      .populate('roomId')
      .populate('hotelId')
      .exec();

    return reservations.map(res => this.formatReservationResponse(res));
  }

  async removeReservation(reservationId: string, userId?: string | Types.ObjectId) {
    const reservation = await this.reservationModel.findById(reservationId).exec();

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (userId && !reservation.userId.equals(typeof userId === 'string' ? new Types.ObjectId(userId) : userId)) {
      throw new ForbiddenException('You do not have permission to cancel this reservation'); // 403
    }

    await this.reservationModel.deleteOne({ _id: reservationId }).exec();

    return { success: true };
  }

  private async isRoomAvailable(roomId: ID, startDate: Date, endDate: Date): Promise<boolean> {
    const overlapping = await this.reservationModel.countDocuments({
      roomId,
      $or: [
        { dateStart: { $lt: endDate }, dateEnd: { $gt: startDate } },
      ],
    });

    return overlapping === 0;
  }

  private formatReservationResponse(reservation: any, room?: any) {
    const r = room || reservation.roomId;
    const h = reservation.hotelId;

    return {
      startDate: reservation.dateStart,
      endDate: reservation.dateEnd,
      hotelRoom: {
        description: r.description,
        images: r.images,
      },
      hotel: {
        title: h.title,
        description: h.description,
      },
    };
  }
}