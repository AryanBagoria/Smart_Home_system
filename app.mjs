import express from 'express';
import path from 'path';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const serialPort = new SerialPort({ path: '/dev/cu.usbmodem142201', baudRate: 9600 });
const parser = serialPort.pipe(new ReadlineParser());

const mongoURI = 'mongodb+srv://user:hello@cluster0.tf7juny.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const arduinoDataSchema = new mongoose.Schema({
  value: String,
  timestamp: { type: Date, default: Date.now },
});

const ArduinoData = mongoose.model('ArduinoData', arduinoDataSchema);

app.get('/control', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'control.html'));
});

app.post('/controlLED', (req, res) => {
  const command = req.body.command;

  if (command === '1' || command === '0' || command === '4' || command === '3') {
    serialPort.write(command, (err) => {
      if (err) {
        console.error('Error sending command to Arduino:', err);
        res.status(500).send('Error sending command to Arduino');
      } else {
        console.log('Sent command to Arduino:', command); // Log the command being sent
        res.send('Command sent to Arduino');
      }
    });
  } else {
    res.status(400).send('Invalid command');
  }
});

parser.on('data', (data) => {
  console.log('Received data from Arduino:', data);

  const arduinoData = new ArduinoData({ value: data });

  arduinoData.save()
    .then((doc) => {
      console.log('Arduino data saved to MongoDB:', doc);
    })
    .catch((error) => {
      console.error('Error saving Arduino data to MongoDB:', error);
    });
});

serialPort.on('error', (err) => {
  console.error('Error:', err.message);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
