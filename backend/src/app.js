import cors from "cors";
import http from "http";
import {Server} from 'socket.io';
import expressSession from "express-session";
import sharedSession from 'express-socket.io-session';
import { auth } from 'express-openid-connect';
import express from "express";
import helmet from "helmet";
import {env} from "./config/env.js";
import {default as allRoutes} from "./routes/index.js";
import {addArtificialDelay} from "./middleware/delayMiddleware.js";
import {setSocketIOInstance} from "./sockets/socketHandler.js";
import {RedisStore} from "connect-redis";
import {connectToDB} from "./config/mongo.js";
import redisClient from "./config/redis.js";

const app = express();

app.use(helmet());
// req.user.userId
const corsOptions = {
    origin: (origin, callback) => {
        if (env.devMode || !origin) {
            // Allow all origins in dev mode and all non-origin requests (server-server) communication
            return callback(null, true);
        }
        if (env.corsOrigin.includes(origin)) {
            return callback(null, origin);
        }

        return callback(new Error("CORS policy does not allow this origin"), false);
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.set('trust proxy', env.devMode ? 'loopback' : ['loopback', 'uniquelocal', '1']); // Allows proxied HTTPs with cloudflare


function buildSessionMiddleware(origin) {
    // If the session is localhost-ed then have lax cookies, same circumstance with devMode env.
    // This allows using the production backend in local testing without consequence.
    const isLocal = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');

    return expressSession({
        store: new RedisStore({client: redisClient}),
        secret: env.passportSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            secure: env.devMode ? false : true,
            httpOnly: true,
            sameSite: env.devMode ? 'lax' : 'none',
            domain: (env.devMode || isLocal) ? undefined : `.${env.rootDomain}`
        }
    });
}

// Use the app session (dynamic session instead)
app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    const dynamicSession = buildSessionMiddleware(origin);
    return dynamicSession(req, res, next);
});

app.use(auth({
    secret: env.auth0Secret,
    clientID: env.auth0ClientId,
    clientSecret: env.auth0ClientSecret,
    issuerBaseURL: env.auth0IssuerBaseUrl,
    baseURL: env.auth0BaseUrl,
    authRequired: false,
    auth0Logout: true,
    routes: {
        callback: '/callback', // optional but explicit
    },
    // 👇 THIS is the key part
    afterCallback: (req, res, session) => {
        session.returnTo = `http://localhost:3000/`; // 👈 your frontend redirect path
        return session;
    }
}));

// Have an artificial delay on all routes in dev mode so we can test actual network functioning
app.use((req,res,next)=>{
    if(env.devMode){
        addArtificialDelay(500)(req,res,next);
    }
    else{
        next();
    }
})

// get user id
app.use((req, res, next) => {
    const auth0User = req.oidc?.user;

    if (auth0User) {
        req.user = {
            userId: auth0User.sub, // 👈 This is the stable Auth0 user ID (e.g., "google-oauth2|1234567890")
            email: auth0User.email,
            name: auth0User.name,
            picture: auth0User.picture,
        };
    }

    next();
});

// Express Routes
app.get(`/`, (req, res) => res.redirect('http://localhost:3000/'));
app.use(allRoutes);

// tells u if ur logged in
app.get('/api/me', (req, res) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ loggedIn: false });
    }
    return res.status(200).json({
        loggedIn: true,
        user: req.user
    });
});


// Use Express App in http server
const server = http.createServer(app);


// WebSocket server
const io = new Server(server, {cors: corsOptions});
setSocketIOInstance(io);

io.use((socket, next) => {
    const origin = socket.handshake.headers.origin || '';
    // share the very same session with the WS connection
    sharedSession(buildSessionMiddleware(origin), { autoSave: true })(
        socket,
        () => {
            const user = socket.handshake?.session?.oidc?.user; // Auth0 user
            if (!user) return next(new Error('Unauthorized (no Auth0 user)'));
            socket.user = user;
            next();
        }
    );
});


// Global crash handler (doesn't work for async errors i.e. basically our entire backend app. But still a good to have feature).
app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json({success: false, message: 'Internal Server Error'});
});


async function startServer() {
    try {
        console.log(`Current environment: ${process.env.NODE_ENV}`);
        await connectToDB();
        console.log("server pre-start tasks finished");
        server.listen(env.port, () => {
            console.log(`Server is running on port ${env.port}`);
        });
    } catch (err) {
        console.error('Error starting server: ', err);
        process.exit(1);
    }
}

startServer();