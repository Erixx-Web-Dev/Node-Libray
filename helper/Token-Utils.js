

const clearCookies = (res) => {
    res.cookie('auth_token', '', {
        maxAge: 0, // 1h hr automatic in browser delete when expired
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
    });
    res.cookie('refresh_token', token, {
        maxAge: 0, // 1d automatic in browser delete when expired -> 3hrs
        secure: process.env.NODE_ENV !== "development",
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
    })
}   

const generateTokenResetPass = (length) => {
    let pass = '';
    let str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 
            'abcdefghijklmnopqrstuvwxyz0123456789@#$';
      
    for (let i = 1; i <= length; i++) {
        let char = Math.floor(Math.random()
                    * str.length + 1);
          
        pass += str.charAt(char)
    }
      
    return pass;
}


const jwtError = (error) => {
    let response = {
        message: null,
        status_code: null,
        status: null
    };
    switch(error.name) {
        case "TokenExpiredError":
            response.message = "Token Key Authorization Expired. Need to Renew Token.";
            response.status_code = 4033;
            response.status = 403;
            break;
        case "JsonWebTokenError":
            response.message = "Token Key Authorization Invalid Formed.";
            response.status_code = 4033;
            response.status = 403;
          break;
        case "NotBeforeError":
            response.message = "Token Key Authorization Not Active";
            response.status_code = 4033;
            response.status = 403;
          break;
        default:
          response = null;
      }

      return response;
}

module.exports = {
    clearCookies,
    jwtError,
    generateTokenResetPass
}