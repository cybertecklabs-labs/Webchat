# Contributing to WebChat

We're excited that you're interested in contributing to WebChat! This project aims to provide a high-performance, secure, and visually stunning communication platform for gaming communities.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/WebChat.git
   cd WebChat
   ```
3. **Set up the development environment**:
   - Ensure you have Docker and Docker Compose installed.
   - Copy `.env.example` to `.env`.
   - Start the services: `docker compose up --build`.

## Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand.
- **Backend (Auth)**: Go (Fiber), MongoDB.
- **Backend (Core)**: Rust (Axum), MongoDB, Redis.
- **Real-time**: WebSockets (Rust).
- **Encryption**: Olm (JS-WASM).

## Development Workflow

- Use individual branches for features or bug fixes.
- Follow the existing code style (use `npm run lint` in the frontend).
- Write descriptive commit messages.

## Communication

- For general questions, join our community server (Discord/WebChat).
- For bugs, please open an Issue.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
