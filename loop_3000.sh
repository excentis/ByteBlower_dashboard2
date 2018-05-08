#!/bin/bash

# $RANDO
echo "running post loops";
for i in `seq 1 200`;
do curl -X POST -H "Content-Type: application/json" -d '{"downstream": "'$((RANDOM%100))'", "upstream": "'$((RANDOM%100))'"}' "http://10.1.1.17:8080/Huawei/";
curl -X POST -H "Content-Type: application/json" -d '{"downstream": "'$((RANDOM%100))'", "upstream": "'$((RANDOM%100))'"}' "http://10.1.1.17:8080/bcm/";
curl -X POST -H "Content-Type: application/json" -d '{"downstream": "'$((RANDOM%100))'", "upstream": "'$((RANDOM%100))'"}' "http://10.1.1.17:8080/intel/";
done;
