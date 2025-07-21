# Check message in kafka docker
docker exec -it kafka_broker kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic user-events --from-beginning --timeout-ms 5000

# Check topic in kafka docker
docker exec -it kafka_broker kafka-topics.sh --bootstrap-server localhost:9092 --list

# Check test coverage
npx jest --coverage

# Docker pg query table
docker exec -it postgres_db psql -U user appdb
SELECT * FROM "public"."Inventory";

