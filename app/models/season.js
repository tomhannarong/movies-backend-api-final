module.exports = (sequelize, Sequelize) => {
    const Season = sequelize.define(
        'season',
        {
            id: {
                type: Sequelize.INTEGER,
                field: 'id',
                autoIncrement: true,
                primaryKey: true
            },
            movie_id: {
                type: Sequelize.INTEGER,
                field: 'movie_id'
            },
            uuid: {
                type: Sequelize.STRING(255),
                field: 'uuid'
            },
            season_no: {
                type: Sequelize.INTEGER(2),
                field: 'season_no'
            },
            poster_vertical: {
                type: Sequelize.STRING(255),
                field: 'poster_vertical'
            },
            poster_horizontal: {
                type: Sequelize.STRING(255),
                field: 'poster_horizontal'
            },
            title: {
                type: Sequelize.STRING(255),
                field: 'title'
            },
            title_en: {
                type: Sequelize.STRING(255),
                field: 'title_en'
            },
            description: {
                type: Sequelize.TEXT,
                field: 'description'
            },
            description_en: {
                type: Sequelize.TEXT,
                field: 'description_en'
            },
            trailer: {
                type: Sequelize.STRING(255),
                field: 'trailer'
            },
            release_date: {
                type: Sequelize.DATE,
                field: 'release_date'
            },
            views: {
                type: Sequelize.INTEGER,
                field: 'views'
            },
            status_delete: {
                type: Sequelize.BOOLEAN,
                field: 'status_delete'
            },
            created_by: {
                type: Sequelize.INTEGER,
                field: 'created_by'
            },
            updated_by: {
                type: Sequelize.INTEGER,
                field: 'updated_by'
            },
            deleted_by: {
                type: Sequelize.INTEGER,
                field: 'deleted_by'
            },
            created_at: {
                type: Sequelize.DATE,
                field: 'created_at'
            },
            updated_at: {
                type: Sequelize.DATE,
                field: 'updated_at'
            },
            deleted_at: {
                type: Sequelize.DATE,
                field: 'deleted_at'
            }
        },
        {
            timestamps: false,
            freezeTableName: true
        }
    );
    return Season;
};