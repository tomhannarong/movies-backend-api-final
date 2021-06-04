module.exports = (sequelize, Sequelize) => {
    const Rates = sequelize.define(
        'rates' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            code: {
                type: Sequelize.STRING(5) ,
                field: 'code'
            } ,
            description: {
                type: Sequelize.STRING(100) ,
                field: 'description'
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
    return Rates;
};