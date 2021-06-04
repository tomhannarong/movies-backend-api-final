module.exports = (sequelize, Sequelize) => {
    const Movie_packages = sequelize.define(
        'movie_packages' ,
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
            package_id: {
                type: Sequelize.INTEGER ,
                field: 'package_id'
            }
        } ,
        {
            timestamps: false ,
            freezeTableName: true
        }
    );
    return Movie_packages;
};