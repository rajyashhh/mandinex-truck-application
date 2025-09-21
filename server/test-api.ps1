# PowerShell script to test the API endpoints

# Test start-trip endpoint
$body = @{
    driverPhone = "1234567890"
    ridePin = "123"
    latitude = 28.6139
    longitude = 77.2090
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/start-trip" -Method Post -Body $body -ContentType "application/json"
Write-Host "Start Trip Response:" -ForegroundColor Green
$response | ConvertTo-Json

# Test update-location endpoint
$body2 = @{
    tripId = "TRIP_123_1234567890"
    driverPhone = "1234567890"
    latitude = 28.6140
    longitude = 77.2091
    speed = 30
    heading = 45
    altitude = 200
    accuracy = 10
    batteryLevel = 85
    networkType = "4g"
} | ConvertTo-Json

Write-Host "`nTesting update-location endpoint..." -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:3001/api/update-location" -Method Post -Body $body2 -ContentType "application/json"
Write-Host "Update Location Response:" -ForegroundColor Green
$response2 | ConvertTo-Json
