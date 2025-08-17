import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation } from './schemas/reservation.schema';
import { HotelRoomsService } from '../hotels/hotel-rooms.service';
import { ID } from '../types';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<Reservation>,
    private hotelRoomsService: HotelRoomsService,
  ) {
  }

  async addReservation(userId: ID, roomId: ID, startDate: Date, endDate: Date) {
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

    await reservation.save();
    return this.formatReservationResponse(reservation, room);
  }

  async getReservations(userId: ID) {
    const reservations = await this.reservationModel
      .find({ userId })
      .populate('roomId')
      .populate('hotelId')
      .exec();

    return reservations.map(res => this.formatReservationResponse(res));
  }

  async getManagerReservations(userId?: ID) {
    const filter = userId ? { userId } : {};
    const reservations = await this.reservationModel
      .find(filter)
      .populate('roomId')
      .populate('hotelId')
      .exec();

    return reservations.map(res => this.formatReservationResponse(res));
  }

  async removeReservation(id: ID, userId: ID) {
    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId.toString() !== userId.toString()) {
      throw new BadRequestException('Cannot delete another user reservation');
    }

    await this.reservationModel.findByIdAndDelete(id).exec();
  }

  async removeReservationByManager(id: ID) {
    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    await this.reservationModel.findByIdAndDelete(id).exec();
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