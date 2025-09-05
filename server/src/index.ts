import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'VoiceParty Server is running!' });
});



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


