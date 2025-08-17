import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {
  }

  @Post('client/reservations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  async createClientReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req,
  ) {
    return this.reservationsService.addReservation(
      req.user.userId,
      createReservationDto.hotelRoom,
      new Date(createReservationDto.startDate),
      new Date(createReservationDto.endDate),
    );
  }

  @Get('client/reservations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  async getClientReservations(@Req() req) {
    console.log('req', req.user);
    return this.reservationsService.getReservations(req.user.userId);
  }

  @Get('manager/reservations/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async getManagerReservations(@Param('userId') userId?: string) {
    return this.reservationsService.getManagerReservations(userId);
  }

  @Delete('manager/reservations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async removeManagerReservation(@Param('id') id: string) {
    return this.reservationsService.removeReservationByManager(id);
  }
}