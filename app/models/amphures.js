module.exports = (sequelize, Sequelize) => {
    const Amphures = sequelize.define(
        'amphures' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            province_id: {
                type: Sequelize.INTEGER(5) ,
                field: 'province_id'
            } ,
            code: {
                type: Sequelize.STRING(4) ,
                field: 'code'
            } ,
            name_th: {
                type: Sequelize.STRING(150) ,
                field: 'name_th'
            } ,
            name_en: {
                type: Sequelize.STRING(150) ,
                field: 'name_en'
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
    return Amphures;
};