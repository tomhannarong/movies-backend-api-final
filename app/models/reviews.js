module.exports = (sequelize, Sequelize) => {
    const Reviews = sequelize.define(
        'reviews' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            rating: {
                type: Sequelize.TINYINT(1) ,
                field: 'rating'
            } ,
            description: {
                type: Sequelize.TEXT ,
                field: 'description'
            } ,
            movie_id: {
                type: Sequelize.INTEGER ,
                field: 'movie_id'
            } ,
            member_id: {
                type: Sequelize.INTEGER ,
                field: 'member_id'
            } ,
            status_delete: {
                type: Sequelize.BOOLEAN ,
                defaultValue: false
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
    return Reviews;
};