# ================= Dockerfile =================
#
# This file defines a set of instructions used
# by the Docker Engine to create a Docker Image
# ==============================================

# Use node version 24.12.0
FROM node:24.12.0 AS build

LABEL maintainer="Aaron Ngo ango24@myseneca.ca"
LABEL description="Fragments node.js microservice"

# Use /app as our working directory
WORKDIR /app

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/

## Install node dependencies defined in package-lock.json
# RUN npm install

# cache the dependency installation layer
RUN npm ci

# Copy src to /app/src/
COPY ./src ./src
# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# lighter for the runtime
FROM node:24-alpine3.21

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

WORKDIR /app
COPY --from=build /app .

# We run our service on port 8080
EXPOSE 8080

# Start the container by running our server
# CMD npm start
CMD ["npm", "start"]
