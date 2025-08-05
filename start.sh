#!/bin/sh

echo "Running tests..."
npm run test

if [ $? -eq 0 ]; then
  echo "Tests passed! Starting application..."
  node dist/main
else
  echo "Tests failed! Exiting."
  exit 1
fi
