
const validateParams =  (requestType, requestParams) => {
    return (req, res, next) => {
        const requestVerb = requestType === 'get'? req.query : req.body
        for (let param of requestParams) {
            if (checkParamPresent(Object.keys(requestVerb), param)) {
                let reqParam = requestVerb[param.param_key]

                if (!checkParamType(reqParam, param)) {
                    return res.status(400).send({
                        result: `${param.param_key} is of type ` + `${typeof reqParam} but should be ${param.type}`
                    })
                } 
            } else if (param.required){
                return res.status(400).send({ result: `Missing Parameter ${param.param_key}` })
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