# QA image for visual inspection of the built site.
# NOTE: intentionally built WITHOUT Supabase env — this image is for
# UI/3D visual QA (content falls back to the editable fallbacks).
# Production deployments use the hosting platform's build pipeline.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
