const path = require('path');
const flatCache = require('flat-cache');

let cache = flatCache.load('MNShopCache', path.resolve('./cache'));

const cacheMiddleware = (req, res, next) => {
    let key = `__MNShop__${req.originalUrl || req.url}`;
    let catchContent = cache.getKey(key)
    if (catchContent) {
        res.send(JSON.parse(catchContent));
    } else {
        res.sendResponse = res.send;
        res.send = (body) => {
            cache.setKey(key, body);
            cache.save();
            res.sendResponse(body)
        }
        next()
    }
}

exports.cache = cacheMiddleware;
exports.flatCache = flatCache;