const geoip = require('geoip-lite');

const locations = (req)=>{
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const idBrow = req.headers['x-em-uid'];
    console.log("getLocationIP" + idBrow)
    const ipsub = ip.replace(/^.*:/, '');
    const location  = geoip.lookup("110.169.42.121");
    if(!location){
        return false;
    }
    return {
        city: location.city + ", " + location.country,
        ip: ipsub
    }
    
}

module.exports = locations