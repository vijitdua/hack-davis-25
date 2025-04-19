import cors from "cors";
import http from "http";
import {Server} from 'socket.io';
import expressSession from "express-session";
import sharedSession from 'express-socket.io-session';
import express from "express";
import helmet from "helmet";
import {env} from "./config/env.js";
import {default as allRoutes} from "./routes/index.js";
import {addArtificialDelay} from "./middleware/delayMiddleware.js";
import {setSocketIOInstance} from "./sockets/socketHandler.js";
import {RedisStore} from "connect-redis";
import {connectToDB} from "./config/mongo.js";

const app = express();

app.use(helmet());

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

// Have an artificial delay on all routes in dev mode so we can test actual network functioning
app.use((req,res,next)=>{
    if(env.devMode){
        addArtificialDelay(500)(req,res,next);
    }
    else{
        next();
    }
})

// Express Routes
app.get(`/`, (req, res) => res.status(200).send('alive'));
app.use(allRoutes);

// Use Express App in http server
const server = http.createServer(app);


// WebSocket server
const io = new Server(server, {cors: corsOptions});
setSocketIOInstance(io);

io.use((socket, next) => {
    // TODO: no authentication for now (especially not passport based)...
    // const origin = socket.handshake.headers.origin || '';
    // const dynamicSession = buildSessionMiddleware(origin);
    // sharedSession(dynamicSession, { autoSave: true })(socket, async () => {
    //     const userId = socket.handshake?.session?.passport?.user;
    //
    //     if (!userId) {
    //         return next(new Error("Unauthenticated"));
    //     }
    //
    //     try {
    //         const user = await new Promise((resolve, reject) => {
    //             passport.deserializeUser(userId, (err, user) => {
    //                 if (err) return reject(err);
    //                 resolve(user);
    //             });
    //         });
    //
    //         if (!user) return next(new Error("User not found"));
    //         socket.request.user = user;
    //         return next();
    //     } catch (err) {
    //         return next(err);
    //     }
    // });
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