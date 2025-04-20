import {fileURLToPath} from "url";
import {dirname, join} from "path";
import * as dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../');

export const env = {
    devMode: process.env.NODE_ENV === "development",

    corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map(origin => origin.trim()),
    port: process.env.PORT || 3020,
    serverLocation: process.env.SERVER_LOCATION || 'http://localhost:3020',
    rootDomain: process.env.ROOT_DOMAIN || 'localhost',

    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,

    auth0ClientId      : process.env.AUTH0_CLIENT_ID,
    auth0ClientSecret  : process.env.AUTH0_CLIENT_SECRET,
    auth0IssuerBaseUrl : process.env.AUTH0_ISSUER_BASE_URL,
    auth0BaseUrl       : process.env.AUTH0_BASE_URL,
    auth0Secret        : process.env.AUTH0_SECRET,

    
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    mongoURI: process.env.MONGO_URI,

    passportSecret: process.env.PASSPORT_SECRET || 'abcdefghijklmnopqrstuvwxyz',

    rootLocation: projectRoot,
}