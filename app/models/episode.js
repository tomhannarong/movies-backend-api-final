module.exports = (sequelize, Sequelize) => {
    const Episode = sequelize.define(
        'episode',
        {
            id: {
                type: Sequelize.INTEGER,
                field: 'id',
                autoIncrement: true,
                primaryKey: true
            },
            season_id: {
                type: Sequelize.INTEGER,
                field: 'season_id'
            },
            uuid: {
                type: Sequelize.STRING(255),
                field: 'uuid'
            },
            ep: {
                type: Sequelize.INTEGER(6),
                field: 'ep'
            },
            name: {
                type: Sequelize.STRING(100),
                field: 'name'
            },
            name_en: {
                type: Sequelize.STRING(100),
                field: 'name_en'
            },
            description: {
                type: Sequelize.TEXT,
                field: 'description'
            },
            description_en: {
                type: Sequelize.TEXT,
                field: 'description_en'
            },
            link: {
                type: Sequelize.STRING(255),
                field: 'link'
            },
            runtime: {
                type: Sequelize.INTEGER(3),
                field: 'runtime'
            },
            release_date: {
                type: Sequelize.DATE,
                field: 'release_date'
            },
            is_comingsoon: {
                type: Sequelize.BOOLEAN,
                field: 'is_comingsoon'
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
    return Episode;
};