#!/bin/bash

BASEURL=http://localhost:3000/
HELLO=hello
REVERSE=reverse

curl "$BASEURL"
echo "\n"
curl $BASEURL$HELLO
echo "\n"
curl $BASEURL$REVERSE
echo "\n"
curl -X POST $BASEURL$HELLO
echo "\n"
curl -X POST $BASEURL$REVERSE
echo "\n"
curl --data 'name=Don' $BASEURL$HELLO
echo "\n"
curl --data 'name=Don' --data 'cat=cat' $BASEURL$HELLO
echo "\n"
curl --data 'name=Don' --data 'cat=cat' $BASEURL$REVERSE
echo "\n"
