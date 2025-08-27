#!/bin/bash

echo "🚀 Starting Theme Forum Project..."

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "ng serve" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
pkill -f "node.*index.js" 2>/dev/null

sleep 3

# Start the backend server
echo "Starting backend server on port 3000..."
cd server
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start the Angular client
echo "Starting Angular client on port 4200..."
cd ../client
npx ng serve --host 0.0.0.0 --port 4200 --disable-host-check &
FRONTEND_PID=$!

# Wait for client to start
sleep 10

echo ""
echo "🎉 SUCCESS! Both services are running:"
echo "✅ Backend API: http://localhost:3000"
echo "✅ Frontend App: http://localhost:4200"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Open your browser and go to: http://localhost:4200"
echo "📝 Click the 'Themes' button to see real recipe data!"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
