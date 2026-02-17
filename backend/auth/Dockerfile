FROM rust:latest as builder
WORKDIR /app
COPY . .
RUN cargo build --release -p auth

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/auth /app/auth
COPY .env /app/.env
CMD ["/app/auth"]
