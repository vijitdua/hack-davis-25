// this is done so that the entire app shares the same socket instance

let io = null;

export const setSocketIOInstance = (ioInstance) => {
    io = ioInstance;
};

export const getSocketIOInstance = () => io;