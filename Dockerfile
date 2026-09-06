FROM node:20-alpine

WORKDIR /app

# copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# copy application source code
COPY . .

# expose API port
EXPOSE 3000

# start server
CMD ["node", "app.js"]
