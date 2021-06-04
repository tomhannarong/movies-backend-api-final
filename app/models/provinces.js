module.exports = (sequelize, Sequelize) => {
    const Provinces = sequelize.define(
        'provinces' ,
        {
            id: {
                type: Sequelize.INTEGER(5) ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            code: {
                type: Sequelize.STRING(2) ,
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
            geography_id: {
                type: Sequelize.INTEGER(5) ,
                field: 'geography_id'
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
    return Provinces;
};