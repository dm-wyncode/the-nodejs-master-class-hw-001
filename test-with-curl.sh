#!/bin/bash

URL=http://localhost:3000/hello
curl http://localhost:3000/
echo "\n"
curl "$URL"
curl -X POST "$URL"
echo "\n"
curl --data "word=world" --data "cat=cat" "$URL"
echo "\n"
