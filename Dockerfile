FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production

COPY . .

# Hugging Face Spaces run on port 7860 by default
ENV PORT=7860
EXPOSE 7860

CMD ["npm", "start"]
