 const removeTokens = (req, res) => {
    res.clearCookie('auth_token');
    res.clearCookie('refresh_token');
    req.cookies['auth_token'] = '';
    req.cookies['refresh_token'] = '';
}

module.exports ={
    removeTokens
}