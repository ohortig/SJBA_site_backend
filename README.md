# Stern Jewish Business Association Backend API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/ohortig/SJBA_site_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/ohortig/SJBA_site_backend/actions/workflows/ci.yml)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://api.nyu-sjba.org)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.x-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A Node.js/Express backend API for the Stern Jewish Business Association website.

**Live API**: [api.nyu-sjba.org](https://api.nyu-sjba.org)
**Live Frontend**: [nyu-sjba.org](https://nyu-sjba.org)
**Status Page**: [status.nyu-sjba.org](https://status.nyu-sjba.org)

> **Note:** This README will be updated soon with full information on local development and production deployment.

## API Documentation

| URL                                                | Description              |
| -------------------------------------------------- | ------------------------ |
| [`/docs`](https://api.nyu-sjba.org/docs)           | Swagger UI               |
| [`/docs.json`](https://api.nyu-sjba.org/docs.json) | Raw JSON spec for agents |

Locally: `http://localhost:3000/docs`

## Available Scripts

- `npm run dev` - Start development server with hot reload (tsx watch)
- `npm start` - Start production server
- `npm run build` - Compile TypeScript
- `npm run build:check` - Type-check without emitting
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without writing
- `npm test` - Run Jest tests
- `npm run seed` - Seed database with sample data
- `npm run seed:clear` - Clear database

> **Note:** `helmet` and `supertest` are included as dependencies for future implementation

## Contact

Omer Hortig

Email: [oh2065@nyu.edu](mailto:oh2065@nyu.edu)

Feel free to reach out to report bugs, ask questions, or inquire about joining the development team.

## License

This project is licensed under the [MIT License](./LICENSE).
