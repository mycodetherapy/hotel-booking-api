## Description

This is an API for a hotel viewing and booking aggregator website.
Uses Nest.js, MongoDB, WebSocket.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Build and run docker container

```bash
$ docker compose up --build
```

## Modules

| Method      | URL                                              | Action                         | Comment                                                                                                           |
|-------------|--------------------------------------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `GET`       | `/api/common/hotel-rooms`                        | search hotel rooms             | Query: `limit`, `offset`, `hotel`; if unauthenticated or role = client, only `isEnabled: true` rooms are returned |
| `GET`       | `/api/common/hotel-rooms/:id`                    | get room details               | Public endpoint                                                                                                   |
| `POST`      | `/api/admin/hotels/`                             | create hotel                   | Admin only                                                                                                        |
| `GET`       | `/api/admin/hotels/`                             | list hotels                    | Admin only; Query: `limit`, `offset`, `title`                                                                     |
| `PUT`       | `/api/admin/hotels/:id`                          | update hotel                   | Admin only                                                                                                        |
| `POST`      | `/api/admin/hotel-rooms/`                        | create hotel room              | Admin only; multipart/form-data, upload images                                                                    |
| `PUT`       | `/api/admin/hotel-rooms/:id`                     | update hotel room              | Admin only; multipart/form-data, update images & `isEnabled` flag                                                 |
| `POST`      | `/api/client/reservations`                       | create reservation             | Client only                                                                                                       |
| `GET`       | `/api/client/reservations`                       | list current user reservations | Client only                                                                                                       |
| `DELETE`    | `/api/client/reservations/:id`                   | cancel reservation             | Client only                                                                                                       |
| `GET`       | `/api/manager/reservations/:userId`              | list user reservations         | Manager only                                                                                                      |
| `DELETE`    | `/api/manager/reservations/:id`                  | cancel reservation             | Manager only                                                                                                      |
| `POST`      | `/api/auth/login`                                | user login                     | Starts session with cookies                                                                                       |
| `POST`      | `/api/auth/logout`                               | logout                         | Clears session cookies                                                                                            |
| `POST`      | `/api/client/register`                           | client registration            | Unauthenticated users only                                                                                        |
| `POST`      | `/api/admin/users/`                              | create user                    | Admin only                                                                                                        |
| `GET`       | `/api/admin/users/`                              | list users                     | Admin only Query: `limit`, `offset`, `name`, `contactPhone`                                                       |
| `GET`       | `/api/manager/users/`                            | list users                     | Manager only Query: `limit`, `offset`, `name`, `contactPhone`                                                     |
| `POST`      | `/api/client/support-requests/`                  | create support request         | Client only                                                                                                       |
| `GET`       | `/api/client/support-requests/`                  | list support requests          | Client only Query: `limit`, `offset`, `isActive`                                                                  |
| `GET`       | `/api/manager/support-requests/`                 | list support requests          | Manager only; includes client info Query: `limit`, `offset`, `isActive`                                           |
| `GET`       | `/api/common/support-requests/:id/messages`      | get chat messages              | Client (creator) or manager only                                                                                  |
| `POST`      | `/api/common/support-requests/:id/messages`      | send chat message              | Client (creator) or manager only                                                                                  |
| `POST`      | `/api/common/support-requests/:id/messages/read` | mark messages as read          | Client (creator) or manager only                                                                                  |
| `WebSocket` | `subscribeToChat`                                | subscribe to chat messages     | Client (creator) or manager only                                                                                  |

## Roles & Access

Public: Room search & details.

Client: Reservations, support requests, chat.

Admin: Manage hotels, rooms, users.

Manager: Manage reservations, users, support requests, chat.

