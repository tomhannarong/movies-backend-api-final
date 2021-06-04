module.exports = (sequelize, Sequelize) => {
    const Movie_categories = sequelize.define(
        'movie_categories' ,
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
            category_id: {
                type: Sequelize.INTEGER ,
                field: 'category_id'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Movie_categories;
};