module.exports = {
    database: 'streaming' ,
    username: 'adesso' ,
    password: 'Adesso456!' ,
    host: '150.95.31.162' ,
    dialect: 'mysql' ,
    pool: {
        max: 5 ,
        min: 0 ,
        acquire: 3000 ,
        idle: 10000
    }
};

