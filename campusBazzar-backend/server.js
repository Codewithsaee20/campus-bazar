import 'dotenv/config'; // ✅ this works correctly with ES modules

import app from './src/app.js';
import connectDB from './src/config/dbconnection.js';

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to the database", err);
    });