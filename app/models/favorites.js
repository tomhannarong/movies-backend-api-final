module.exports = (sequelize, Sequelize) => {
    const Favorites = sequelize.define(
        'favorites' ,
        {
            id: {
                type: Sequelize.INTEGER ,
                field: 'id' ,
                autoIncrement: true ,
                primaryKey: true
            } ,
            movie_id: {
                type: Sequelize.INTEGER ,
                field: 'movie_id'
            } ,
            member_id: {
                type: Sequelize.INTEGER ,
                field: 'member_id'
            } ,
            created_at: {
                type: Sequelize.DATE ,
                field: 'created_at'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Favorites;
};