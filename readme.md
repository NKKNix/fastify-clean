# Check message in kafka docker
docker exec -it kafka_broker kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic user-events --from-beginning --timeout-ms 5000

# Check topic in kafka docker
docker exec -it kafka_broker kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check test coverage
npx jest --coverage

# Docker pg query table
docker exec -it postgres_db psql -U user appdb
SELECT * FROM "public"."Inventory";

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