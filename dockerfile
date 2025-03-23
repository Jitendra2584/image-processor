FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create directories for uploads and processed images
RUN mkdir -p uploads processed

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]