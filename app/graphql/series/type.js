const { gql } = require('apollo-server-express');

const type = gql`
    input getAll {
        keyword: String ,
        page: Int ,
        limit: Int
    }

    input getSeason {
        series_uuid: String! ,
        keyword: String ,
        page: Int ,
        limit: Int
    }

    input createSeries {
        season_no: Int! ,
        series_name: String! ,
        series_name_en: String! ,
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
        trailer: String! ,
        release_date: String! ,
        rate_id: Int! ,
        category_list_id: String! ,
        poster_v: String! ,
        poster_h: String!
    }

    input updateSeries {
        series_uuid: String! ,
        is_comingsoon: Int! ,
        series_name: String! ,
        series_name_en: String! ,
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
        trailer: String! ,
        release_date: String! ,
        rate_id: Int! ,
        category_list_id: String! ,
        poster_v: String ,
        poster_h: String
    }

    input createSeason {
        series_uuid: String! ,
        season_no: Int! ,
        title: String! ,
        title_en: String! ,
        description: String! ,
        description_en: String! ,
        trailer: String! ,
        release_date: String! ,
        poster_v: String! ,
        poster_h: String!
    }

    input updateSeason {
        season_uuid: String! ,
        season_no: Int! ,
        title: String! ,
        title_en: String! ,
        description: String! ,
        description_en: String! ,
        trailer: String! ,
        release_date: String! ,
        poster_v: String! ,
        poster_h: String!
    }

    input createEpisode {
        series_uuid: String! ,
        season_uuid: String! ,
        episode_no: Int! ,
        is_comingsoon: Int! ,
        episode_name: String! ,
        episode_name_en: String! ,
        description: String! ,
        description_en: String! ,
        link: String! ,
        runtime: Int! ,
        release_date: String!
    }

    input updateEpisode {
        series_uuid: String! ,
        episode_uuid: String! ,
        episode_no: Int! ,
        is_comingsoon: Int! ,
        episode_name: String! ,
        episode_name_en: String! ,
        description: String! ,
        description_en: String! ,
        link: String! ,
        runtime: Int! ,
        release_date: String!
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

    type episode {
        episode_uuid: String ,
        episode_no: Int ,
        episode_name: String ,
        episode_name_en: String ,
        description: String ,
        description_en: String ,
        link: String ,
        runtime: Int,
        is_comingsoon: Int,
        views: Int,
        release_date: String
    }

    type status {
        code: Int! ,
        message: String!
    }

    type duplicateSeries {
        name: Int ,
        name_en: Int ,
        trailer: Int
    }

    type duplicateEpisode {
        name: Int ,
        name_en: Int ,
        link: Int ,
        ep: Int
    }

    type duplicateSeason {
        season_no: Int,
        trailer : Int
    }

    type pagination {
        limit: Int! ,
        previous_page: Int! ,
        current_page: Int! ,
        next_page: Int!
    }

    type dataGetSeries {
        series_uuid: String ,
        is_comingsoon: Int ,
        series_name: String ,
        series_name_en: String ,
        poster_h: String ,
        release_date: String ,
        views: Int ,
        rate: rate ,
        created_by: user ,
        updated_by: user
    }

    type dataGetSeason {
        season_no: Int ,
        season_uuid: String ,
        series_name: String ,
        series_name_en: String ,
        poster_h: String ,
        release_date: String ,
        views: Int ,
        rate: rate ,
        created_by: user ,
        updated_by: user
    }

    type dataCreateSeries {
        series_uuid: String ,
        season_uuid: String
    }

    type dataCreateSeason {
        season_uuid: String
    }

    type dataGetSeriesByUuid {
        isaActive_comingsoon: Int ,
        is_comingsoon: Int ,
        series_name: String ,
        series_name_en: String ,
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
        trailer: String ,
        release_date: String ,
        views: Int ,
        rate: rate ,
        category: [category] ,
        option_rate: select ,
        option_category: [select]
    }

    type dataGetSeasonByUuid {
        series_name: String ,
        series_name_en: String ,
        season_no: Int ,
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
        trailer: String ,
        release_date: String ,
        views: Int ,
        rate: rate ,
        episode: [episode]
    }

    type dataGetEpisodeByUuid {
        series_uuid:String ,
        episode_uuid: String ,
        episode_no: Int ,
        is_comingsoon: Int ,
        episode_name: String ,
        episode_name_en: String ,
        description: String ,
        description_en: String ,
        link: String ,
        runtime: Int ,
        views: Int ,
        release_date: String
    }

    type resultGetSeries {
        total: Int ,
        pagination: pagination ,
        data: [dataGetSeries]
    }

    type resultGetSeason {
        total: Int ,
        pagination: pagination ,
        data: [dataGetSeason]
    }

    type resultGetSeriesByUuid {
        data: dataGetSeriesByUuid
    }

    type resultGetSeasonByUuid {
        data: dataGetSeasonByUuid
    }

    type resultGetEpisodeByUuid {
        data: dataGetEpisodeByUuid
    }

    type resultCreateSeries {
        data :dataCreateSeries
        duplicate: duplicateSeries
    }

    type resultUpdateSeries{
        duplicate: duplicateSeries
    }

    type resultCreateSeason {
        data: dataCreateSeason ,
        duplicate: duplicateSeason
    }
    type resultUpdateSeason{
        duplicate: duplicateSeason
    }

    type resultCreateEpisode{
        duplicate: duplicateEpisode
    }
    type resultUpdateEpisode{
        duplicate: duplicateEpisode
    }

    type responseGetSeries {
        status: status! ,
        result: resultGetSeries
    }

    type responseGetSeason {
        status: status! ,
        result: resultGetSeason
    }

    type responseGetSeriesByUuid {
        status: status! ,
        result: resultGetSeriesByUuid
    }

    type responseGetSeasonByUuid {
        status: status! ,
        result: resultGetSeasonByUuid
    }

    type responseGetEpisodeByUuid {
        status: status! ,
        result: resultGetEpisodeByUuid
    }

    type responseCreateSeries {
        status: status! ,
        result: resultCreateSeries
    }

    type responseUpdateSeries {
        status: status!
        result: resultUpdateSeries
    }

    type responseCreateSeason {
        status: status! ,
        result: resultCreateSeason
    }

    type responseUpdateSeason {
        status: status!
        result : resultUpdateSeason
    }

    type responseCreateEpisode {
        status: status! ,
        result: resultCreateEpisode
    }

    type responseUpdateEpisode {
        status: status! ,
        result: resultUpdateEpisode
    }

    type response {
        status: status!
    }

    type Query {
        getSeries(input: getAll): responseGetSeries ,
        getSeason(input: getSeason): responseGetSeason ,
        getSeriesByUuid(seriesUuid: String!): responseGetSeriesByUuid ,
        getSeasonByUuid(seasonUuid: String!): responseGetSeasonByUuid ,
        getEpisodeByUuid(episodeUuid: String!): responseGetEpisodeByUuid
    }

    type Mutation {
        createSeries(input: createSeries): responseCreateSeries ,
        updateSeries(input: updateSeries): responseUpdateSeries ,
        deleteSeries(seriesUuid: String!): response ,
        createSeason(input: createSeason): responseCreateSeason ,
        updateSeason(input: updateSeason): responseUpdateSeason ,
        deleteSeason(seasonUuid: String!): response ,
        createEpisode(input: createEpisode): responseCreateEpisode ,
        updateEpisode(input: updateEpisode): responseUpdateEpisode ,
        deleteEpisode(episodeUuid: String!): response
    }
`;

module.exports = type;