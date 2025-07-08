require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const OpenAI = require('openai'); // correct import for v5

const app = express();
const port = 3000;

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enable CORS so your Expo app can talk to this backend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Setup multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Chat endpoint using OpenAI SDK v5
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ reply: 'Error talking to AI. Please try again.' });
  }
});

// Analyze endpoint remains the same
app.post('/analyze', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  console.log('Received file:', req.file.originalname);
  res.json({ result: `This looks like a sample tablet (file: ${req.file.originalname}).` });

  // Delete uploaded file after processing
  fs.unlink(req.file.path, (err) => {
    if (err) console.error('Failed to delete file:', err);
  });
});

// Start the backend server
app.listen(port, () => {
  console.log(`✔ Backend server running on http://localhost:${port}`);
});

