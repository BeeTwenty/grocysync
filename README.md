
# GrocySync Self-Hosted

This is a self-hosted version of GrocySync, a collaborative grocery list app.

## Features

- Create and manage grocery lists
- Automatically categorize items
- Collaborative real-time updates
- User authentication
- Profile management

## Requirements

- Docker and Docker Compose
- Node.js 18+ (for development)

## Getting Started

### Running with Docker Compose

1. Clone this repository
2. Create a `.env` file based on `.env.example`
3. Generate a secure JWT secret and update in `.env`
4. Start the containers:

```bash
docker-compose up -d
```

5. Access the application at http://localhost:8080

### Development Setup

1. Clone this repository
2. Install dependencies for the main app:

```bash
npm install
```

3. Install dependencies for the API:

```bash
cd api && npm install
```

4. Set up PostgreSQL database and update the `.env` file
5. Run the database migrations:

```bash
cd api && npm run migrate
```

6. Start the API in development mode:

```bash
cd api && npm run dev
```

7. Start the frontend in development mode:

```bash
npm run dev
```

8. Access the application at http://localhost:5173

## Database Migration

The application includes migration scripts to help you migrate your data from Supabase to a self-hosted PostgreSQL database. To migrate your existing data:

1. Export your data from Supabase (either through the UI or using their CLI)
2. Update the `.env` file with your database connection details
3. Import your data using the appropriate migration scripts in the `migrations` folder

## Production Deployment

When deploying to production:

1. Change the default passwords in `docker-compose.yml`
2. Generate a secure JWT secret for authentication
3. Set up a proper reverse proxy (like Nginx or Traefik) with SSL
4. Configure proper backups for your PostgreSQL database

## License

MIT
