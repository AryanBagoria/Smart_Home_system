#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);
const int led1Pin = 7; // Define the first LED pin
const int led2Pin = 8; // Define the second LED pin

bool led1State = false; // Initialize LED 1 state to OFF (LOW)
bool led2State = false; // Initialize LED 2 state to OFF (LOW)

void setup() {
  Serial.begin(9600);
  dht.begin();
  pinMode(led1Pin, OUTPUT); // Set the first LED pin as an output
  pinMode(led2Pin, OUTPUT); // Set the second LED pin as an output
  turnOnLED(led2Pin); // Ensure the first LED is initially turned on
}

void loop() {
  delay(2000); // Delay for sensor readings

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print("%\t");
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");

  // Check for incoming commands from serial communication
  while (Serial.available()) {
    char command = Serial.read();
    if (command == '1') {
      turnOnLED(led1Pin);
    } else if (command == '0') {
      turnOffLED(led1Pin);
    } else if (command == '4') {
      turnOnLED(led2Pin);
    } else if (command == '3') {
      turnOffLED(led2Pin);
    }
  }
}

void turnOnLED(int pin) {
  digitalWrite(pin, HIGH); // Turn on the LED
  Serial.println("LED turned on");
  if (pin == led1Pin) {
    led1State = true;
  } else if (pin == led2Pin) {
    led2State = true;
  }
}

void turnOffLED(int pin) {
  digitalWrite(pin, LOW); // Turn off the LED
  Serial.println("LED turned off");
  if (pin == led1Pin) {
    led1State = false;
  } else if (pin == led2Pin) {
    led2State = false;
  }
}
