# Docker and install eventstore for logging

Docker compose up -d

docker run --name esdb-node -it -p 2113:2113 \
    eventstore/eventstore:latest --insecure --run-projections=All
    --enable-atom-pub-over-http

# Migrate Database

npx prisma migrate dev

npx prisma generate

# Run project
npm run dev
