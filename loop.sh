#!/bin/bash

# $RANDO
echo "running post loops";
for i in `seq 1 20000`;
do curl -X POST -H "Content-Type: application/json" -d '{"downstream": "'$((RANDOM%100))'", "upstream": "'$((RANDOM%100000))'"}' "http://10.1.1.17:80/acm/";
curl -X POST -H "Content-Type: application/json" -d '{"downstream": "'$((RANDOM%100))'", "upstream": "'$((RANDOM%100))'000000"}' "http://10.1.1.17:80/askey/";
curl -X POST -H "Content-Type: application/json" -d '{"downstream": "'$((RANDOM%100))'", "upstream": "'$((RANDOM%100))'"}' "http://10.1.1.17:80/intel/";
done;
