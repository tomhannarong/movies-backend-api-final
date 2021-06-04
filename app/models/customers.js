module.exports = (sequelize, Sequelize) => {
    const Customers = sequelize.define(
        'customers',
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
                type: Sequelize.STRING(100),
                field: 'name'
            },
            domain: {
                type: Sequelize.STRING(255),
                field: 'domain'
            },
            ip_address: {
                type: Sequelize.STRING(20),
                field: 'ip_address'
            },
            tel: {
                type: Sequelize.STRING(12),
                field: 'tel'
            },
            address: {
                type: Sequelize.STRING(255),
                field: 'address'
            },
            limit_package: {
                type: Sequelize.INTEGER,
                field: 'limit_package'
            },
            province_id: {
                type: Sequelize.INTEGER(5),
                field: 'province_id'
            },
            amphure_id: {
                type: Sequelize.INTEGER,
                field: 'amphure_id'
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
    return Customers;
};