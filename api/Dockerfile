
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies first (separate layer for better caching)
RUN npm install

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/index.js"]
