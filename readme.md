# Articles Backend

## Tech Stack

*   **Framework**: [NestJS](https://nestjs.com/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
*   **Caching**: [Redis](https://redis.io/)
*   **Authentication**: [Passport.js](http://www.passportjs.org/) with JWT strategy
*   **Containerization**: [Docker](https://www.docker.com/)

## Getting Started

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/maalcjke/articles-backend.git
    cd articles-backend
    ```

2.  **Start the services using Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Access the application:**
    *   The API will be available at `http://localhost:8080`.
    *   The PostgreSQL database will be accessible on port `5432`.
    *   The Redis instance will be accessible on port `6379`.

## API Documentation

Once the application is running, you can access the interactive Swagger API documentation to explore and test the available endpoints.

*   **Swagger UI URL**: `http://localhost:8080/docs`
*   **Postman URL**: `http://localhost:8080/docs-json`

## Project Structure

The project follows a standard NestJS structure:

```
.
├── libs/
│   └── redis/          # Reusable Redis caching module
├── src/
│   ├── articles/       # Articles feature module (controller, service, DTOs, entity)
│   ├── auth/           # Authentication module (controller, services, strategies, guards)
│   ├── common/         # Shared components (interceptors, decorators, base DTOs)
│   ├── config/         # Configuration files for database, JWT, and Redis
│   ├── app.module.ts   # Root application module
│   └── main.ts         # Application entry point
├── Dockerfile          # Defines the application's Docker image
└── docker-compose.yml  # Defines services for the application, database, and cache