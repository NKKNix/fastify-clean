# This repository have 2 branch 2 service
## main and feature/log-history
this repo is contain with OutBoxEvent ,unit test, integrate test, otel tracing,otel metric,kafka producer that send message to kafkaBroker

## service/inventory
this repo is contain kafka consumer that get message from kafkaBroker and it have role to decrease stock in DB

Both Database is seperate not use the same database
