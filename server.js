import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback - serve index.html for non-asset routes
app.get('*', (req, res) => {
  // Skip if request has file extension (asset file)
  if (req.path.includes('.')) {
    return res.status(404).send('File not found');
  }
  
  // Serve index.html for all non-asset routes
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});