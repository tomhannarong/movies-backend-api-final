module.exports = (sequelize, Sequelize) => {
    const Categories = sequelize.define(
        'categories' ,
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
            name_en: {
                type: Sequelize.STRING(100) ,
                field: 'name_en'
            } ,
            status_delete: {
                type: Sequelize.BOOLEAN ,
                field: 'status_delete'
            } ,
            created_by: {
                type: Sequelize.INTEGER ,
                field: 'created_by'
            } ,
            updated_by: {
                type: Sequelize.INTEGER ,
                field: 'updated_by'
            } ,
            deleted_by: {
                type: Sequelize.INTEGER ,
                field: 'deleted_by'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            } ,
            updated_at: {
                type: Sequelize.DATE ,
                field: 'updated_at'
            } ,
            deleted_at: {
                type: Sequelize.DATE ,
                field: 'deleted_at'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Categories;
};