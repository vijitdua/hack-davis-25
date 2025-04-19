import redis from 'redis';
import {env} from "./env.js";

const redisUrl = `redis://${env.redisHost}:${env.redisPort}`;
const redisClient = redis.createClient({
    url: redisUrl
});

// If error with redis connection
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// Confirm redis connection
(async () => {
    try {
        console.log('Connecting to Redis client');
        await redisClient.connect(); // Use the connect method to establish a connection
        console.log(`Connected to Redis at ${env.redisHost} on port ${env.redisPort}`);
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }
})();

export default redisClient;