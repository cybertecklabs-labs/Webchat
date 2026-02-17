FROM rust:latest as builder
WORKDIR /app
COPY . .
RUN cargo build --release -p core

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/core /app/core
COPY .env /app/.env
CMD ["/app/core"]
