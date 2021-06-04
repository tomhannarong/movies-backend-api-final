module.exports = (sequelize, Sequelize) => {
    const Packages = sequelize.define(
        'packages',
        {
            id: {
                type: Sequelize.INTEGER,
                field: 'id',
                autoIncrement: true,
                primaryKey: true
            },
            uuid: {
                type: Sequelize.STRING(255),
                field: 'uuid'
            },
            name: {
                type: Sequelize.STRING(50),
                field: 'name'
            },
            price: {
                type: Sequelize.INTEGER(6),
                field: 'price'
            },
            days: {
                type: Sequelize.INTEGER(4),
                field: 'days'
            },
            max_quality: {
                type: Sequelize.ENUM(5),
                field: 'max_quality'
            },
            limit_device: {
                type: Sequelize.INTEGER(1),
                field: 'limit_device'
            },
            is_default: {
                type: Sequelize.BOOLEAN,
                field: 'is_default'
            },
            customer_id: {
                type: Sequelize.INTEGER,
                field: 'customer_id'
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
    return Packages;
};