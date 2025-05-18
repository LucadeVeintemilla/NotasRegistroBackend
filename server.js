const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emailRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/email', emailRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend server is running properly' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
