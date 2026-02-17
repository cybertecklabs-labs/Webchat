FROM rust:latest as builder
WORKDIR /app
COPY . .
RUN cargo build --release -p realtime

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/realtime /app/realtime
COPY .env /app/.env
CMD ["/app/realtime"]
