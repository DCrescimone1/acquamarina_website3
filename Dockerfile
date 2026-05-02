FROM node:20-bookworm

WORKDIR /app

# Copy package files AND .npmrc (contains legacy-peer-deps=true for React 19 + Radix UI)
COPY package*.json .npmrc ./
RUN npm ci

# CRITICAL: Set browser path BEFORE installing so install and runtime use same location
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install browser matching the exact npm package version, with all system deps
# NODE_OPTIONS ipv4first fixes Railway's IPv6 DNS routing bug that stalls downloads
RUN NODE_OPTIONS="--dns-result-order=ipv4first" npx playwright install --with-deps chromium

# Build-time variables for NEXT_PUBLIC_ embedding (must be set before npm run build)
ARG NEXT_PUBLIC_EMAILJS_SERVICE_ID
ARG NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
ARG NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_EMAILJS_SERVICE_ID=$NEXT_PUBLIC_EMAILJS_SERVICE_ID
ENV NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=$NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
ENV NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=$NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
