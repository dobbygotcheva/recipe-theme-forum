#!/bin/bash

echo "Starting Theme Forum Project..."

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "ng serve" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "node.*index.js" 2>/dev/null

sleep 3

# Start the server
echo "Starting Node.js server on port 3000..."
cd server
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Start the Angular client
echo "Starting Angular client on port 4200..."
cd ../client
npx ng serve --host 0.0.0.0 --port 4200 --disable-host-check &
CLIENT_PID=$!

# Wait for client to start
sleep 10

echo "Project is starting up..."
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"
echo ""
echo "Access your application at:"
echo "Frontend: http://192.168.100.9:4200"
echo "Backend API: http://192.168.100.9:3000/api"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
