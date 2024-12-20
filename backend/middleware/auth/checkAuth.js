import * as HttpCode from "../../HttpsCode.js"

export function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.sendStatus(HttpCode.UNAUTHORIZED)
}
