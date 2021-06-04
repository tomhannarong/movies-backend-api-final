const { gql } = require('apollo-server-express');

const type = gql`
    input getAll {
        keyword: String ,
        page: Int ,
        limit: Int
    }

    input create {
        movie_name: String! ,
        movie_name_en: String! ,
        poster: String ,
        title: String! ,
        title_en: String! ,
        description: String! ,
        description_en: String! ,
        actors: String! ,
        actors_en: String! ,
        directors: String! ,
        directors_en: String! ,
        authors: String! ,
        authors_en: String! ,
        link: String! ,
        trailer: String! ,
        runtime: Int! ,
        release_date: String! ,
        is_comingsoon: Int!,
        rate_id: Int! ,
        category_list_id: String! ,
        poster_v: String! ,
        poster_h: String!
    }

    input update {
        is_comingsoon: Int!,
        movie_uuid: String! ,
        movie_name: String! ,
        movie_name_en: String! ,
        title: String! ,
        title_en: String! ,
        description: String! ,
        description_en: String! ,
        actors: String! ,
        actors_en: String! ,
        directors: String! ,
        directors_en: String! ,
        authors: String! ,
        authors_en: String! ,
        link: String! ,
        trailer: String! ,
        runtime: Int! ,
        release_date: String! ,
        rate_id: Int! ,
        category_list_id: String! ,
        poster_v: String ,
        poster_h: String
    }

    type select {
        value: ID ,
        label: String 
    }

    type rate {
        rate_id: ID ,
        rate_code: String ,
        rate_description: String
    }

    type category {
        category_id: ID ,
        category_name: String ,
        category_name_en: String
    }

    type package {
        package_uuid: String ,
        package_name: String
    }

    type user {
        user_uuid: String ,
        user_name: String
    }

    type status {
        code: Int! ,
        message: String!
    }

    type duplicate{
        name: Int,
        name_en: Int,
        link: Int,
        trailer: Int,
    }

    type pagination {
        limit: Int! ,
        previous_page: Int! ,
        current_page: Int! ,
        next_page: Int!
    }

    type dataGetMovie {
        movie_uuid: String ,
        movie_name: String ,
        movie_name_en: String ,
        poster_h: String ,
        title: String ,
        title_en: String ,
        description: String ,
        description_en: String ,
        actors: String ,
        actors_en: String ,
        directors: String ,
        directors_en: String ,
        authors: String ,
        authors_en: String ,
        link: String ,
        trailer: String ,
        runtime: Int ,
        release_date: String ,
        is_comingsoon:Int,
        views: Int ,
        rate: rate ,
        category: [category] ,
        package: [package] ,
        created_by: user ,
        updated_by: user
    }

    type dataGetMovieByUuid {
        movie_uuid: String ,
        movie_name: String ,
        movie_name_en: String ,
        poster_v: String ,
        poster_h: String ,
        title: String ,
        title_en: String ,
        description: String ,
        description_en: String ,
        actors: String ,
        actors_en: String ,
        directors: String ,
        directors_en: String ,
        authors: String ,
        authors_en: String ,
        link: String ,
        trailer: String ,
        runtime: Int ,
        release_date: String ,
        is_comingsoon: Int,
        views: Int ,
        rate: rate ,
        category: [category] ,
        option_rate: select ,
        option_category: [select] ,  
        created_by: user ,
        updated_by: user
    }

    type dataCreateMovie {
        movie_uuid: String ,
        movie_name: String ,
        movie_name_en: String ,
        poster: String ,
        title: String ,
        title_en: String ,
        description: String ,
        description_en: String ,
        actors: String ,
        actors_en: String ,
        directors: String ,
        directors_en: String ,
        authors: String ,
        authors_en: String ,
        link: String ,
        trailer: String ,
        runtime: Int ,
        release_date: String ,
        rate: rate ,
        category: [category] ,
        created_by: user
    }

    type dataUpdateMovie {
        movie_uuid: String ,
        movie_name: String ,
        movie_name_en: String ,
        poster: String ,
        title: String ,
        title_en: String ,
        description: String ,
        description_en: String ,
        actors: String ,
        actors_en: String ,
        directors: String ,
        directors_en: String ,
        authors: String ,
        authors_en: String ,
        link: String ,
        trailer: String ,
        runtime: Int ,
        release_date: String ,
        rate: rate ,
        category: [category] ,
        updated_by: user
    }

    type resultGetMovie {
        total: Int ,
        pagination: pagination ,
        data: [dataGetMovie]
    }

    type resultGetMovieByUuid {
        data: dataGetMovieByUuid
    }

    type resultCreateMovie {
        data: dataCreateMovie,
        duplicate: duplicate
    }

    type resultUpdateMovie {
        data: dataUpdateMovie,
        duplicate: duplicate
    }

    type responseGetMovie {
        status: status! ,
        result: resultGetMovie
    }

    type responseGetMovieByUuid {
        status: status! ,
        result: resultGetMovieByUuid
    }

    type responseCreateMovie {
        status: status! ,
        result: resultCreateMovie
    }

    type responseUpdateMovie {
        status: status! ,
        result: resultUpdateMovie
    }

    type responseDeleteMovie {
        status: status!
    }

    type Query {
        getMovie(input: getAll): responseGetMovie ,
        getMovieByUuid(movieUuid: String!): responseGetMovieByUuid
    }

    type Mutation {
        createMovie(input: create): responseCreateMovie ,   
        updateMovie(input: update): responseUpdateMovie ,
        deleteMovie(movieUuid: String!): responseDeleteMovie
    }
`;

module.exports = type;