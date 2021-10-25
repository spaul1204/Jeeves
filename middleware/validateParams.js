const ExpressError = require('../utils/ExpressError')

const validateParams =  (requestType, requestParams) => {
    return (req, res, next) => {
        const requestVerb = requestType === 'get'? req.query : req.body
        for (let param of requestParams) {
            if (checkParamPresent(Object.keys(requestVerb), param)) {
                let reqParam = requestVerb[param.param_key]

                if (!checkParamType(reqParam, param)) {
                    return next(new ExpressError(`${param.param_key} is of type ` + `${typeof reqParam} but should be ${param.type}`,400))
                } 
            } else if (param.required){
               return next(new ExpressError(`Missing Parameter ${param.param_key}`,400))
            }
        }
        next();
    }
};

const checkParamPresent = function (reqParams, paramObj) {
    return (reqParams.includes(paramObj.param_key));
};

const checkParamType = function (reqParam, paramObj) {
    const reqParamType = typeof reqParam;
    return reqParamType === paramObj.type;
};



module.exports = { validateParams }