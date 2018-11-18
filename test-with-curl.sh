#!/bin/bash

URL=http://localhost:3000/hello
curl http://localhost:3000/
echo "\n"
curl -X POST "$URL"
echo "\n"
curl --data "word=world" --data "cat=cat" "$URL"
echo "\n"
