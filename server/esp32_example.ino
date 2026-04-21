/*
  ESP32 → Backend Status Reporter
  Sends device ID + battery level to your server every 5 seconds.
  
  Install: ArduinoJson, HTTPClient (built-in ESP32)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* SERVER_URL    = "http://YOUR_PC_IP:4000/status";  // same network IP

const char* DEVICE_ID   = "ESP32-001";
const char* DEVICE_TYPE = "Sensor Node";

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    // Read battery from ADC pin (example: pin 34)
    int raw = analogRead(34);
    float battery = map(raw, 0, 4095, 0, 100);

    StaticJsonDocument<128> doc;
    doc["id"]      = DEVICE_ID;
    doc["type"]    = DEVICE_TYPE;
    doc["battery"] = battery;
    doc["status"]  = (battery < 20) ? "critical" : "active";

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);
    Serial.printf("[ESP32] POST %s → %d\n", SERVER_URL, code);
    http.end();
  }
  delay(5000);
}
