# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install


COPY . .

EXPOSE 5000

# Start the application
CMD ["node", "index.js"]
