# This repository have 2 branch 2 service
## main and feature/log-history
this branch has the role to send message from kafka to kafka Broker, which contain OutBoxEvent ,unit test, integrate test, otel tracing,otel metric,kafka producer, Swagger

## service/inventory
this branch has the role to receive message from kafka broker to decrease order stock in Database

## ETC
 Both branch have seperate Database

