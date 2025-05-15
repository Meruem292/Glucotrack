#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

#define WIFI_SSID "Dasca_PublicWifi"
#define WIFI_PASSWORD "librengwifi$$$"

const String DATABASE_URL = "https://glucotrack-47958-default-rtdb.firebaseio.com";
const String DATABASE_SECRET = "";

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 28800, 60000);

String sessionToken = "";
String matchedUID = "";
int readingCounter = 1;

void connectWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  
  timeClient.begin();
  timeClient.update();
}

String generateToken() {
  String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  String token = "";
  
  for (int i = 0; i < 6; i++) {
    uint32_t r = (random(0, chars.length()) + analogRead(0) + (millis() & 0xFF)) % chars.length();
    token += chars[r];
    delay(1); 
  }
  return token;
}

String getCurrentTimestamp() {
  timeClient.update();
  unsigned long epochTime = timeClient.getEpochTime();
  struct tm *ptm = gmtime((time_t *)&epochTime);
  
  char timestamp[20];
  sprintf(timestamp, "%04d-%02d-%02d %02d:%02d:%02d", 
          ptm->tm_year + 1900, ptm->tm_mon + 1, ptm->tm_mday,
          ptm->tm_hour, ptm->tm_min, ptm->tm_sec);
          
  return String(timestamp);
}

bool findMatchingUser() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = DATABASE_URL + "/users.json";
    if (DATABASE_SECRET != "") url += "?auth=" + DATABASE_SECRET;

    http.begin(url);
    int httpCode = http.GET();
    if (httpCode == 200) {
      String payload = http.getString();
      DynamicJsonDocument doc(8192);
      DeserializationError error = deserializeJson(doc, payload);
      if (!error) {
        JsonObject root = doc.as<JsonObject>();
        for (JsonPair kv : root) {
          String uid = kv.key().c_str();
          JsonObject user = kv.value().as<JsonObject>();
          if (user["profile"]["token"] == sessionToken) {
            matchedUID = uid;
            
            String updateUrl = DATABASE_URL + "/users/" + matchedUID + "/profile/lastConnection.json";
            if (DATABASE_SECRET != "") updateUrl += "?auth=" + DATABASE_SECRET;
            
            HTTPClient updateHttp;
            updateHttp.begin(updateUrl);
            updateHttp.addHeader("Content-Type", "application/json");
            String timestamp = "\"" + getCurrentTimestamp() + "\"";
            int updateCode = updateHttp.PUT(timestamp);
            updateHttp.end();
            
            http.end();
            return true;
          }
        }
      }
    }
    http.end();
  }
  return false;
}

int getHighestReadingNumber() {
  if (WiFi.status() == WL_CONNECTED && matchedUID != "") {
    String path = "/users/" + matchedUID + "/readings.json";
    String url = DATABASE_URL + path;
    if (DATABASE_SECRET != "") url += "?auth=" + DATABASE_SECRET;

    HTTPClient http;
    http.begin(url);
    int httpCode = http.GET();
    
    if (httpCode == 200) {
      String payload = http.getString();
      DynamicJsonDocument doc(8192);  
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error && doc.is<JsonObject>()) {
        JsonObject readings = doc.as<JsonObject>();
        int highestNumber = 0;
        
        for (JsonPair kv : readings) {
          String key = kv.key().c_str();
          if (key.startsWith("reading")) {
            int num = key.substring(7).toInt();
            if (num > highestNumber) {
              highestNumber = num;
            }
          }
        }
        http.end();
        return highestNumber;
      }
    } else if (httpCode == 404) {
      http.end();
      return 0;
    }
    http.end();
  }
  return -1;
}

void sendSensorReadings() {
  if (WiFi.status() == WL_CONNECTED && matchedUID != "") {

    // dito mo pasok readings mo instead na naka random. 
    float glucose = random(2500, 3500) / 100.0;
    float heartRate = random(6000, 9000) / 100.0;
    float spo2 = random(9500, 9900) / 100.0;
    
    String readingTag = "reading" + String(readingCounter);
    
    DynamicJsonDocument doc(256);
    doc["glucose"] = glucose;
    doc["heartRate"] = heartRate;
    doc["spo2"] = spo2;
    doc["timestamp"] = getCurrentTimestamp();
    
    String path = "/users/" + matchedUID + "/readings/" + readingTag + ".json";
    String url = DATABASE_URL + path;
    if (DATABASE_SECRET != "") url += "?auth=" + DATABASE_SECRET;

    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    
    String payload;
    serializeJson(doc, payload);
    
    int httpCode = http.PUT(payload);
    if (httpCode == 200) {
      readingCounter++;
    }
    http.end();
  }
}

void setup() {
  Serial.begin(115200);
  
  uint32_t seed = 0;
  for (int i = 0; i < 32; i++) {
    seed ^= analogRead(0) << i;
    delay(1);
  }
  randomSeed(seed);
  
  connectWiFi();

  sessionToken = generateToken();

  unsigned long startTime = millis();
  while (!findMatchingUser()) {
    if (millis() - startTime > 30000) {
      sessionToken = generateToken();
      startTime = millis();
    }
    delay(2000);
  }

  int highestReading = getHighestReadingNumber();
  readingCounter = (highestReading >= 0) ? highestReading + 1 : 1;
}

void loop() {
  sendSensorReadings();
  delay(5000);
}