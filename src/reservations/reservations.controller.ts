import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../users/decorators/roles.decorator';
import { AuthenticatedGuard } from '../auth/session.serializer';

@Controller()
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {
  }

  @Post('client/reservations')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('client')
  async createClientReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req,
  ) {
    return this.reservationsService.addReservation(
      req.user._id,
      createReservationDto.hotelRoom,
      new Date(createReservationDto.startDate),
      new Date(createReservationDto.endDate),
    );
  }

  @Get('client/reservations')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('client')
  async getClientReservations(@Req() req) {
    return this.reservationsService.getReservations(req.user._id);
  }

  @Get('manager/reservations/:userId')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('manager')
  async getManagerReservations(@Param('userId') userId: string) {
    return this.reservationsService.getReservations(userId);
  }

  @Delete('client/reservations/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('client')
  async cancelClientReservation(@Req() req, @Param('id') id: string) {
    return this.reservationsService.removeReservation(id, req.user._id);
  }

  @Delete('manager/reservations/:id')
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Roles('manager')
  async cancelManagerReservation(@Param('id') id: string) {
    return this.reservationsService.removeReservation(id);
  }
}