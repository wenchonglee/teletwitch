# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.17.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

# Install pnpm
ARG PNPM_VERSION=8.9.2
RUN npm install -g pnpm@$PNPM_VERSION

FROM base as build
# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential pkg-config python-is-python3

# Install node modules
COPY --link package.json pnpm-lock.yaml ./
COPY --link patches ./patches
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .
COPY docker.env .env

# Build application and remove dev dep
RUN pnpm run check
RUN pnpm run build
RUN pnpm prune --prod

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ffmpeg && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "node", "build" ]
