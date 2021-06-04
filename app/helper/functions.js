const db = require("../../config/db");
const sequelize = db.sequelize;
const User = db.users;
const Customer = db.customers;

const query = require('./query');

let conditions, select;

dateTimeNow = () => {
    let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    now = now.split(' ');
    date = now[0];
    time = now[1];
    timeSplit = time.split(':');
    timeSplit[0] = Number(timeSplit[0]) + 7;
    if ( timeSplit[0] > 24 ) timeSplit[0] = timeSplit[0] - 24;
    if ( timeSplit[0] < 10 ) timeSplit[0] = `0${timeSplit[0]}`;
    return `${date} ${timeSplit[0]}:${timeSplit[1]}:${timeSplit[2]}`;
};

compareArrayNumber = (arrayA, arrayB) => {
    if ( arrayA.length != arrayB.length ) return false;
    arrayA = arrayA.sort();
    arrayB = arrayB.sort();
    
    for ( let i = 0; i < arrayA.length; i++ ) {
        if ( arrayA[i] != arrayB[i] ) return false;
    }
    return true;
};

checkMasterAdmin = async (user_uuid) => {
    conditions = {
        status_delete: 0 ,
        is_admin: 0 ,
        uuid: user_uuid
    };
    select = ['id', 'name'];
    const master = await query.findOneByConditions(conditions, User, select);
    
    if ( master ) {
        return {
            status: true , 
            id: master.id ,
            name: master.name
        };
    } else {
        return {
            status: false
        };
    }
};

checkUserCustomer = async (user_uuid, customer_uuid) => {
    conditions = {
        status_delete: 0 ,
        uuid: user_uuid
    };
    select = ['id', 'name', 'customer_id'];
    const user = await query.findOneByConditions(conditions, User, select);
    
    conditions = {
        status_delete: 0 ,
        uuid: customer_uuid
    };
    select = ['id'];
    const customer = await query.findOneByConditions(conditions, Customer, select);

    if ( user.customer_id == customer.id ) {
        return {
            status: true , 
            user_id: user.id ,
            user_name: user.name ,
            customer_id: customer.id
        };
    } else {
        return {
            status: false
        };
    }
};

getCustomerId = async (customer_uuid) => {
    conditions = {
        status_delete: 0 ,
        uuid: customer_uuid
    };
    select = ['id'];
    const customer = await query.findOneByConditions(conditions, Customer, select);
    return customer.id;
};

checkBase64 = (base64) => {
    const pattern = /^data:image\/([A-Za-z-+\/]+);base64,(.+)$/;
    return pattern.test(base64);
}

module.exports = {
    dateTimeNow ,
    compareArrayNumber ,
    checkMasterAdmin ,
    checkUserCustomer ,
    getCustomerId ,
    checkBase64
};