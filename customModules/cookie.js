exports.parse = function(cookies) {
    try {
        let cookieString = "{";
        cookies.split('; ').forEach(cookie => {
            let splitCookie = cookie.split('=');
            if (cookieString.length > 1) {
                cookieString += ",";
            }
            cookieString += "\"" + splitCookie[0] + "\":\"" + splitCookie[1] + "\"";
        });
        cookieString += "}";
        return JSON.parse(cookieString);
    } catch (err) {
        return false;
    }
}