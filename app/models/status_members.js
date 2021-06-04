module.exports = (sequelize, Sequelize) => {
    const Status_members = sequelize.define(
        'status_members' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            name: {
                type: Sequelize.STRING(100) ,
                field: 'name'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Status_members;
};