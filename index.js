const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const userRoutes = require('./src/routes/userRoutes');
const votingRoutes = require('./src/routes/votingRoutes');
const votingOfficerRoutes = require('./src/routes/votingOfficerRoutes');
const { PORT } = process.env;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/user', userRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/voting-officer', votingOfficerRoutes);

app.use(express.static(path.join(__dirname, './online-voting-frontend/my-app/build')));
app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, './online-voting-frontend/my-app/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
