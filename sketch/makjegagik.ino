#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "Dwi Arfian Station"
#define WIFI_PASSWORD "kerenbanget"
#define API_KEY "" // Dirahasiakan karena privasi
#define DATABASE_URL "https://makjegagik-520ec-default-rtdb.asia-southeast1.firebasedatabase.app/" 

int sensor = D1;
int buzzer = D2;

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

int cond = 1;
String buzzerSound = "unmute";
unsigned long sendDataPrevMillis = 0;
bool isSignedUp = false;

void setup() {
  Serial.begin(115200);
  pinMode(sensor, INPUT);
  pinMode(buzzer, OUTPUT);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }

  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("SignUp Successed");
    isSignedUp = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback; 
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  cond = digitalRead(sensor);
  
  if(Firebase.ready() && isSignedUp && (millis() - sendDataPrevMillis > 1000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();
    if(Firebase.RTDB.setInt(&fbdo, "sensor/condition", cond)) {
      Serial.println(); 
      Serial.print(cond);
      Serial.print(" = Success saved to: " + fbdo.dataPath());
      Serial.println("(" + fbdo.dataType() + ")");
    } else {
      Serial.println("FAILED: " + fbdo.errorReason());
    }
  }

  if(Firebase.RTDB.getString(&fbdo, "buzzer/sound")) {
    buzzerSound = fbdo.stringData();
    Serial.println("Buzzer Sound: " + buzzerSound);
  } else {
    Serial.println("Failed to fetch buzzer sound: " + fbdo.errorReason());
  }

  if (buzzerSound != "mute") {
    if (cond == LOW) {
      digitalWrite(buzzer, LOW);
      delay(1000);
      digitalWrite(buzzer, HIGH);
    } else {
      digitalWrite(buzzer, HIGH);
    }
  } else {
    digitalWrite(buzzer, HIGH);
  }
}
