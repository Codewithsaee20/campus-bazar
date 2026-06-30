import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'src', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

const [{ default: app }, { default: connectDB }] = await Promise.all([
    import('./src/app.js'),
    import('./src/config/dbconnection.js'),
]);

const PORT = process.env.PORT || 3000;

await connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});