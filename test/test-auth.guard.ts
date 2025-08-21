import { CanActivate, ExecutionContext } from '@nestjs/common';

export class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    request.user = {
      _id: '111111111111111111111111',
      id: '111111111111111111111111',
      role: 'client',
      email: 'test@example.com',
      name: 'Test User',
    };

    request.isAuthenticated = () => true;

    return true;
  }
}

export class TestManagerAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = {
      _id: '222222222222222222222222',
      id: '222222222222222222222222',
      role: 'manager',
      email: 'manager@example.com',
      name: 'Test Manager',
    };

    request.isAuthenticated = () => true;

    return true;
  }
}


// import { CanActivate, ExecutionContext } from '@nestjs/common';
// import { Types } from 'mongoose';
//
// export class TestAuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest();
//
//     // Простой фиксированный user для тестов
//     request.user = {
//       _id: new Types.ObjectId('68a6229cfddf50e592d7506c'),
//       id: '68a6229cfddf50e592d7506c',
//       role: 'client',
//       email: 'test@example.com',
//     };
//
//     return true;
//   }
// }
