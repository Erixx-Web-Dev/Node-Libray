

const roleprotect = (roles) => async(req, res, next) => {
    try {
        let canProceed = false;
        if(!roles || roles.length <= 0) {
            return next();
        }

        if(!req.user) {
            let response = {message: 'You are unathenticated.', status: 401}; 
            return res.status(response.status).json({message: response.message});
        }

        const {user} = req; 

        canProceed = user?.role?.find((role) => {
            return roles.includes(role.name);
        });

        if(canProceed) {
            return next();
        } 

        let response = {message: 'You are unauthorized.', status: 401, status_code: 4011}; 
        return res.status(response.status).json({message: response.message, status_code: response.status_code});

    } catch (error) {
        let response = {message: 'You are unauthorized.', status: 401, status_code: 4011}; 
        return res.status(response.status).json({message: response.message, status_code: response.status_code});
    }
}

module.exports = {
    roleprotect
}

