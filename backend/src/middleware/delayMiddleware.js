export function addArtificialDelay(ms) {
    return (req, res, next) => {
        setTimeout(() => {
            next();
        }, ms);
    };
}