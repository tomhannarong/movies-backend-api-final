module.exports = (sequelize, Sequelize) => {
    const Histories = sequelize.define(
        'histories' ,
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
    return Histories;
};