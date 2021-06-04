module.exports = (sequelize, Sequelize) => {
    const Help_topics = sequelize.define(
        'help_topics',
        {
            id: {
                type: Sequelize.INTEGER,
                field: 'id',
                autoIncrement: true,
                primaryKey: true
            },
            customer_id: {
                type: Sequelize.INTEGER,
                field: 'customer_id'
            },
            topic: {
                type: Sequelize.STRING(100),
                field: 'topic'
            },
            topic_en: {
                type: Sequelize.STRING(100),
                field: 'topic_en'
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
    return Help_topics;
};