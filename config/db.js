const Sequelize = require('sequelize');
const dbconfig = require('./env');
const sequelize = new Sequelize(dbconfig.database, dbconfig.username, dbconfig.password, {
    host: dbconfig.host,
    dialect: dbconfig.dialect,
    operatorsAliases: 0,
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci'
    },
    pool: {
        max: dbconfig.max,
        min: dbconfig.pool.min,
        acquire: dbconfig.pool.acquire,
        idle: dbconfig.pool.idle
    }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// import model
db.amphures = require('../app/models/amphures')(sequelize, Sequelize);
db.categories = require('../app/models/categories')(sequelize, Sequelize);
db.customers = require('../app/models/customers')(sequelize, Sequelize);
db.episode = require('../app/models/episode')(sequelize, Sequelize);
db.favorites = require('../app/models/favorites')(sequelize, Sequelize);
db.histories = require('../app/models/histories')(sequelize, Sequelize);
db.impose_menus = require('../app/models/impose_menus')(sequelize, Sequelize);
db.member = require('../app/models/member')(sequelize, Sequelize);
db.movies = require('../app/models/movies')(sequelize, Sequelize);
db.movie_categories = require('../app/models/movie_categories')(sequelize, Sequelize);
db.movie_packages = require('../app/models/movie_packages')(sequelize, Sequelize);
db.packages = require('../app/models/packages')(sequelize, Sequelize);
db.permissions = require('../app/models/permissions')(sequelize, Sequelize);
db.provinces = require('../app/models/provinces')(sequelize, Sequelize);
db.rates = require('../app/models/rates')(sequelize, Sequelize);
db.reviews = require('../app/models/reviews')(sequelize, Sequelize);
db.roles = require('../app/models/roles')(sequelize, Sequelize);
db.season = require('../app/models/season')(sequelize, Sequelize);
db.status_members = require('../app/models/status_members')(sequelize, Sequelize);
db.users = require('../app/models/users')(sequelize, Sequelize);
db.oath_user_clients = require('../app/models/oath_user_clients')(sequelize, Sequelize);
db.user_refresh_tokens = require('../app/models/user_refresh_tokens')(sequelize, Sequelize);

db.help_lists = require('../app/models/help_lists')(sequelize, Sequelize);
db.help_topics = require('../app/models/help_topics')(sequelize, Sequelize);
db.manage_categories = require('../app/models/manage_categories')(sequelize, Sequelize);

// help comingsoon
db.help_topics.hasMany(db.help_lists, { foreignKey: 'help_topic_id' });
db.help_lists.belongsTo(db.help_topics, { foreignKey: 'help_topic_id' });

db.customers.hasMany(db.help_topics, { foreignKey: 'customer_id' });
db.help_topics.belongsTo(db.customers, { foreignKey: 'customer_id' });


// association amphures
db.amphures.hasMany(db.customers, { foreignKey: 'amphure_id' });
db.customers.belongsTo(db.amphures, { foreignKey: 'amphure_id' });

// association categories
db.categories.hasOne(db.movie_categories, { foreignKey: 'category_id' });
db.movie_categories.belongsTo(db.categories, { foreignKey: 'category_id' });

// association customer
db.customers.hasOne(db.users, { foreignKey: 'customer_id' });
db.users.belongsTo(db.customers, { foreignKey: 'customer_id' });

db.customers.hasOne(db.movies, { foreignKey: 'customer_id' });
db.movies.belongsTo(db.customers, { foreignKey: 'customer_id' });

db.customers.hasOne(db.member, { foreignKey: 'customer_id' });
db.member.belongsTo(db.customers, { foreignKey: 'customer_id' });

db.customers.hasOne(db.packages, { foreignKey: 'customer_id' });
db.packages.belongsTo(db.customers, { foreignKey: 'customer_id' });

// association episode
db.episode.hasOne(db.season, { foreignKey: 'season_id' });
db.season.belongsTo(db.episode, { foreignKey: 'season_id' });

// association impose_menus
db.impose_menus.hasMany(db.permissions, { foreignKey: 'impose_menu_id' });
db.permissions.belongsTo(db.impose_menus, { foreignKey: 'impose_menu_id' });

// association members
db.member.hasMany(db.favorites, { foreignKey: 'member_id' });
db.favorites.belongsTo(db.member, { foreignKey: 'member_id' });

db.member.hasMany(db.histories, { foreignKey: 'member_id' });
db.histories.belongsTo(db.member, { foreignKey: 'member_id' });

db.member.hasMany(db.reviews, { foreignKey: 'member_id' });
db.reviews.belongsTo(db.member, { foreignKey: 'member_id' });

// association movies
db.movies.hasMany(db.favorites, { foreignKey: 'movie_id' });
db.favorites.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.histories, { foreignKey: 'movie_id' });
db.histories.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.movie_categories, { foreignKey: 'movie_id' });
db.movie_categories.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.movie_packages, { foreignKey: 'movie_id' });
db.movie_packages.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.reviews, { foreignKey: 'movie_id' });
db.reviews.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.movies.hasMany(db.season, { foreignKey: 'movie_id' });
db.season.belongsTo(db.movies, { foreignKey: 'movie_id' });

// association package
db.packages.hasMany(db.movie_packages, { foreignKey: 'package_id' });
db.movie_packages.belongsTo(db.packages, { foreignKey: 'package_id' });

db.packages.hasOne(db.member, { foreignKey: 'package_id' });
db.member.belongsTo(db.packages, { foreignKey: 'package_id' });

// association provices
db.provinces.hasMany(db.customers, { foreignKey: 'province_id' });
db.customers.belongsTo(db.provinces, { foreignKey: 'province_id' });

db.provinces.hasMany(db.amphures, { foreignKey: 'province_id' });
db.amphures.belongsTo(db.provinces, { foreignKey: 'province_id' });

// association rates
db.rates.hasOne(db.movies, { foreignKey: 'rate_id' });
db.movies.belongsTo(db.rates, { foreignKey: 'rate_id' });

// association season
db.season.hasOne(db.episode, { foreignKey: 'season_id' });
db.episode.belongsTo(db.season, { foreignKey: 'season_id' });

// association roles
db.roles.hasMany(db.permissions, { foreignKey: 'role_id' });
db.permissions.belongsTo(db.roles, { foreignKey: 'role_id' });

db.roles.hasMany(db.users, { foreignKey: 'role_id' });
db.users.belongsTo(db.roles, { foreignKey: 'role_id' });

// assocaition status_members
db.status_members.hasMany(db.member, { foreignKey: 'status_member_id' });
db.member.belongsTo(db.status_members, { foreignKey: 'status_member_id' });

// association users
// db.users.hasOne(db.categories, { foreignKey: 'created_by' });
// db.categories.belongsTo(db.users, { foreignKey: 'created_by' });

// db.users.hasOne(db.categories, { foreignKey: 'updated_by' });
// db.categories.belongsTo(db.users, { foreignKey: 'updated_by' });

// db.users.hasOne(db.categories, { foreignKey: 'deleted_by' });
// db.categories.belongsTo(db.users, { foreignKey: 'deleted_by' });

// db.users.hasOne(db.customers, { foreignKey: 'created_by' });
// db.customers.belongsTo(db.users, { foreignKey: 'created_by' });

// db.users.hasOne(db.customers, { foreignKey: 'updated_by' });
// db.customers.belongsTo(db.users, { foreignKey: 'updated_by' });

// db.users.hasOne(db.customers, { foreignKey: 'deleted_by' });
// db.customers.belongsTo(db.users, { foreignKey: 'deleted_by' });

db.users.hasOne(db.movies, { foreignKey: 'created_by' });
db.movies.belongsTo(db.users, { foreignKey: 'created_by' });

db.users.hasMany(db.oath_user_clients, { foreignKey: 'user_id' });
db.oath_user_clients.belongsTo(db.users, { foreignKey: 'user_id' });

db.oath_user_clients.hasOne(db.user_refresh_tokens, { foreignKey: 'client_id' });
db.user_refresh_tokens.belongsTo(db.oath_user_clients, { foreignKey: 'client_id' });



db.customers.hasOne(db.manage_categories, { foreignKey: 'customer_id' });
db.manage_categories.belongsTo(db.customers, { foreignKey: 'customer_id' });
db.categories.hasOne(db.manage_categories, { foreignKey: 'category_id' });
db.manage_categories.belongsTo(db.categories, { foreignKey: 'category_id' });

module.exports = db;