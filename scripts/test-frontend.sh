#!/bin/bash
cd ./services/api && npm run dev &
BACKEND_PID=$!
sleep 2
cd ./frontend && npm run test
TEST_EXIT=$?
kill $BACKEND_PID
exit $TEST_EXIT
