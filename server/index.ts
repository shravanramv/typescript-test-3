import express from 'express';
import cors from 'cors';
import { User } from './models/User';

const app = express();
app.use(cors()); // Add CORS middleware
app.use(express.json());

// ... existing routes (register/login) ...

const PORT = process.env.PORT || 8080; // Change port to 8080
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));