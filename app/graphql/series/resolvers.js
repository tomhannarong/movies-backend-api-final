const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const Movie = db.movies;
const Season = db.season;
const Episode = db.episode;
const Rate = db.rates;
const Category = db.categories;
const MovieCategory = db.movie_categories;
const Package = db.packages;
const MoviePackage = db.movie_packages;
const User = db.users;

const generatePassword = require('password-generator');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const config = require('config');
const baseUrl = config.baseUrl;
const rootPath = config.rootPath;
const pathSize = config.pathSize;

const query = require('../../helper/query');
const functions = require('../../helper/functions');
const e = require('cors');
const { count } = require('console');

let conditions, select, join, order, data;
let page = 1;
let limit = 10;
let checkPermission = false;

const resolvers = {
    Query: {
        getSeries: async (_, { input }, { context }) => {
            if (input.page) page = input.page;
            if (input.limit) limit = input.limit;
            let keyword = input.keyword;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    type: 1,
                    customer_id: context.customerId
                };
                if (keyword) {
                    conditions = {
                        status_delete: 0,
                        type: 1,
                        customer_id: context.customerId,
                        [Op.or]: {
                            name: { [Op.regexp]: keyword },
                            name_en: { [Op.regexp]: keyword },
                            title: { [Op.regexp]: keyword },
                            title_en: { [Op.regexp]: keyword },
                            description: { [Op.regexp]: keyword },
                            description_en: { [Op.regexp]: keyword },
                            actors: { [Op.regexp]: keyword },
                            actors_en: { [Op.regexp]: keyword },
                            directors: { [Op.regexp]: keyword },
                            directors_en: { [Op.regexp]: keyword },
                            authors: { [Op.regexp]: keyword },
                            authors_en: { [Op.regexp]: keyword }
                        }
                    };
                }
                const total = await query.countDataRows(conditions, Movie);
                if (total == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                select = [
                    [sequelize.col('movies.id'), 'series_id'],
                    [sequelize.col('movies.uuid'), 'series_uuid'],
                    [sequelize.col('movies.is_comingsoon'), 'is_comingsoon'],
                    [sequelize.col('movies.name'), 'series_name'],
                    [sequelize.col('movies.name_en'), 'series_name_en'],
                    [sequelize.col('movies.poster_horizontal'), 'poster_h'],
                    [sequelize.col('movies.release_date'), 'release_date'],
                    [sequelize.col('movies.views'), 'views'],
                    [sequelize.col('movies.created_by'), 'created_by'],
                    [sequelize.col('movies.updated_by'), 'updated_by'],
                    [sequelize.col('rate.id'), 'rate_id'],
                    [sequelize.col('rate.code'), 'rate_code'],
                    [sequelize.col('rate.description'), 'rate_description']
                ];
                join = [
                    { model: Rate, attributes: [], require: true }
                ];
                order = [
                    ['created_at', 'DESC']
                ];
                const series = await query.findAllLimitByConditions(conditions, Movie, select, join, order, page, limit);

                for (const item of series) {
                    select = [
                        [sequelize.col('users.uuid'), 'user_uuid'],
                        [sequelize.col('users.name'), 'user_name']
                    ];
                    let createdBy;
                    if (item.created_by) {
                        conditions = {
                            status_delete: 0,
                            id: item.created_by
                        };
                        createdBy = await query.findOneByConditions(conditions, User, select);
                    }
                    let updatedBy;
                    if (item.updated_by) {
                        conditions = {
                            status_delete: 0,
                            id: item.updated_by
                        };
                        updatedBy = await query.findOneByConditions(conditions, User, select);
                    }

                    let posterH = `${baseUrl}/img/no-poster-h.jpg`;
                    if (item.poster_h) {
                        posterH = item.poster_h.split('/');
                        posterH = `${baseUrl}/${posterH[0]}/sm/${posterH[1]}/${posterH[2]}`;
                    }

                    item.poster_h = posterH;
                    item.rate = {
                        rate_id: item.rate_id,
                        rate_code: item.rate_code,
                        rate_description: item.rate_description
                    };
                    item.created_by = createdBy;
                    item.updated_by = updatedBy;
                }

                let previous = page - 1;
                let next = 0;
                if ((page * limit) < total) next = page + 1;
                const pagination = {
                    limit: limit,
                    current_page: page,
                    previous_page: previous,
                    next_page: next
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        total: total,
                        pagination: pagination,
                        data: series
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        getSeason: async (_, { input }, { context }) => {
            const seriesUuid = input.series_uuid;
            if (input.page) page = input.page;
            if (input.limit) limit = input.limit;
            let keyword = input.keyword;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0
                };
                if (keyword) {
                    conditions = {
                        status_delete: 0,
                        [Op.or]: {
                            season_no: { [Op.regexp]: keyword },
                            title: { [Op.regexp]: keyword },
                            title_en: { [Op.regexp]: keyword },
                            description: { [Op.regexp]: keyword },
                            description_en: { [Op.regexp]: keyword }
                        }
                    };
                }
                join = [
                    { model: Movie, where: { uuid: seriesUuid, status_delete: 0, customer_id: context.customerId }, attributes: [], require: true }
                ];
                const total = await query.countDataRows(conditions, Season, join);
                if (total == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                select = [
                    [sequelize.col('movie.name'), 'series_name'],
                    [sequelize.col('movie.name_en'), 'series_name_en'],
                    [sequelize.col('season.season_no'), 'season_no'],
                    [sequelize.col('season.uuid'), 'season_uuid'],
                    [sequelize.col('season.poster_horizontal'), 'poster_h'],
                    [sequelize.col('season.release_date'), 'release_date'],
                    [sequelize.col('season.views'), 'views'],
                    [sequelize.col('season.created_by'), 'created_by'],
                    [sequelize.col('season.updated_by'), 'updated_by']
                ];
                order = [
                    ['created_at', 'DESC']
                ];
                const season = await query.findAllLimitByConditions(conditions, Season, select, join, order, page, limit);

                for (const item of season) {
                    select = [
                        [sequelize.col('users.uuid'), 'user_uuid'],
                        [sequelize.col('users.name'), 'user_name']
                    ];
                    let createdBy;
                    if (item.created_by) {
                        conditions = {
                            status_delete: 0,
                            id: item.created_by
                        };
                        createdBy = await query.findOneByConditions(conditions, User, select);
                    }
                    let updatedBy;
                    if (item.updated_by) {
                        conditions = {
                            status_delete: 0,
                            id: item.updated_by
                        };
                        updatedBy = await query.findOneByConditions(conditions, User, select);
                    }

                    let posterH = `${baseUrl}/img/no-poster-h.jpg`;
                    if (item.poster_h) {
                        posterH = item.poster_h.split('/');
                        posterH = `${baseUrl}/${posterH[0]}/sm/${posterH[1]}/${posterH[2]}`;
                    }

                    item.series_name = `${item.series_name} ซีซั่น ${item.season_no}`;
                    item.series_name_en = `${item.series_name_en} Season ${item.season_no}`;
                    item.poster_h = posterH;
                    item.created_by = createdBy;
                    item.updated_by = updatedBy;
                }

                let previous = page - 1;
                let next = 0;
                if ((page * limit) < total) next = page + 1;
                const pagination = {
                    limit: limit,
                    current_page: page,
                    previous_page: previous,
                    next_page: next
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        total: total,
                        pagination: pagination,
                        data: season
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        getSeriesByUuid: async (_, { seriesUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seriesUuid,
                    customer_id: context.customerId
                };
                select = [
                    [sequelize.col('movies.id'), 'series_id'],
                    [sequelize.col('movies.is_comingsoon'), 'is_comingsoon'],
                    [sequelize.col('movies.name'), 'series_name'],
                    [sequelize.col('movies.name_en'), 'series_name_en'],
                    [sequelize.col('movies.poster_vertical'), 'poster_v'],
                    [sequelize.col('movies.poster_horizontal'), 'poster_h'],
                    [sequelize.col('movies.title'), 'title'],
                    [sequelize.col('movies.title_en'), 'title_en'],
                    [sequelize.col('movies.description'), 'description'],
                    [sequelize.col('movies.description_en'), 'description_en'],
                    [sequelize.col('movies.actors'), 'actors'],
                    [sequelize.col('movies.actors_en'), 'actors_en'],
                    [sequelize.col('movies.directors'), 'directors'],
                    [sequelize.col('movies.directors_en'), 'directors_en'],
                    [sequelize.col('movies.authors'), 'authors'],
                    [sequelize.col('movies.authors_en'), 'authors_en'],
                    [sequelize.col('movies.trailer'), 'trailer'],
                    [sequelize.col('movies.release_date'), 'release_date'],
                    [sequelize.col('movies.views'), 'views'],
                    [sequelize.col('movies.created_by'), 'created_by'],
                    [sequelize.col('movies.updated_by'), 'updated_by'],
                    [sequelize.col('rate.id'), 'rate_id'],
                    [sequelize.col('rate.code'), 'rate_code'],
                    [sequelize.col('rate.description'), 'rate_description']
                ];
                join = [
                    { model: Rate, attributes: [], require: true }
                ];
                const series = await query.findOneByConditions(conditions, Movie, select, join);
                if (!series) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                const optionRate = {
                    value: series.rate_id,
                    label: `${series.rate_code}: ${series.rate_description}`
                };

                conditions = {
                    movie_id: series.series_id
                };
                select = [
                    [sequelize.col('category.id'), 'category_id'],
                    [sequelize.col('category.name'), 'category_name'],
                    [sequelize.col('category.name_en'), 'category_name_en']
                ];
                join = [
                    { model: Category, attributes: [], require: true }
                ];
                const category = await query.findAllByConditions(conditions, MovieCategory, select, join);
                let optionCategory = [];
                for (const item of category) {
                    let tmp = {
                        value: item.category_id,
                        label: `${item.category_name} ${item.category_name_en}`
                    };
                    optionCategory.push(tmp);
                }

                select = [
                    [sequelize.col('users.uuid'), 'user_uuid'],
                    [sequelize.col('users.name'), 'user_name']
                ];
                let createdBy;
                if (series.created_by) {
                    conditions = {
                        status_delete: 0,
                        id: series.created_by
                    };
                    createdBy = await query.findOneByConditions(conditions, User, select);
                }
                let updatedBy;
                if (series.updated_by) {
                    conditions = {
                        status_delete: 0,
                        id: series.updated_by
                    };
                    updatedBy = await query.findOneByConditions(conditions, User, select);
                }

                let posterV = `${baseUrl}/img/no-poster-v.jpg`;
                let posterH = `${baseUrl}/img/no-poster-h.jpg`;
                if (series.poster_v) {
                    posterV = series.poster_v.split('/');
                    posterV = `${baseUrl}/${posterV[0]}/md/${posterV[1]}/${posterV[2]}`;
                }
                if (series.poster_h) {
                    posterH = series.poster_h.split('/');
                    posterH = `${baseUrl}/${posterH[0]}/md/${posterH[1]}/${posterH[2]}`;
                }


                let isaActive_comingsoon = 1;
                conditions = {
                    status_delete: 0,
                    movie_id: series.series_id
                };
                select = ['id'];
                const seasonId = await query.findAllByConditions(conditions, Season, select);
                if (seasonId.length > 0) {
                    for (const item of seasonId) {
                        conditions = {
                            status_delete: 0,
                            season_id: item.id,
                            is_comingsoon: 0
                        }
                        const count = await query.countDataRows(conditions, Episode)
                        if (count > 0) isaActive_comingsoon = 0;
                    }
                }
                console.log(isaActive_comingsoon)

                data = {
                    isaActive_comingsoon: isaActive_comingsoon,
                    is_comingsoon: series.is_comingsoon,
                    series_name: series.series_name,
                    series_name_en: series.series_name_en,
                    poster_v: posterV,
                    poster_h: posterH,
                    title: series.title,
                    title_en: series.title_en,
                    description: series.description,
                    description_en: series.description_en,
                    actors: series.actors,
                    actors_en: series.actors_en,
                    directors: series.directors,
                    directors_en: series.directors_en,
                    authors: series.authors,
                    authors_en: series.authors_en,
                    trailer: series.trailer,
                    release_date: series.release_date,
                    views: series.views,
                    rate: {
                        rate_id: series.rate_id,
                        rate_code: series.rate_code,
                        rate_description: series.rate_description
                    },
                    category: category,
                    option_rate: optionRate,
                    option_category: optionCategory
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: data
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        getSeasonByUuid: async (_, { seasonUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seasonUuid
                };
                select = [
                    [sequelize.col('movie.name'), 'series_name'],
                    [sequelize.col('movie.name_en'), 'series_name_en'],
                    [sequelize.col('movie.actors'), 'actors'],
                    [sequelize.col('movie.actors_en'), 'actors_en'],
                    [sequelize.col('movie.directors'), 'directors'],
                    [sequelize.col('movie.directors_en'), 'directors_en'],
                    [sequelize.col('movie.authors'), 'authors'],
                    [sequelize.col('movie.authors_en'), 'authors_en'],
                    [sequelize.col('movie.rate_id'), 'rate_id'],
                    [sequelize.col('season.id'), 'season_id'],
                    [sequelize.col('season.season_no'), 'season_no'],
                    [sequelize.col('season.poster_vertical'), 'poster_v'],
                    [sequelize.col('season.poster_horizontal'), 'poster_h'],
                    [sequelize.col('season.title'), 'title'],
                    [sequelize.col('season.title_en'), 'title_en'],
                    [sequelize.col('season.description'), 'description'],
                    [sequelize.col('season.description_en'), 'description_en'],
                    [sequelize.col('season.trailer'), 'trailer'],
                    [sequelize.col('season.release_date'), 'release_date'],
                    [sequelize.col('season.views'), 'views']
                ];
                join = [
                    { model: Movie, where: { status_delete: 0, customer_id: context.customerId }, attributes: [], require: true }
                ];
                const season = await query.findOneByConditions(conditions, Season, select, join);
                if (!season) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                select = [
                    [sequelize.col('rates.id'), 'rate_id'],
                    [sequelize.col('rates.code'), 'rate_code'],
                    [sequelize.col('rates.description'), 'rate_description']
                ];
                const rate = await query.findOneByConditions({ id: season.rate_id }, Rate, select);

                let posterV = `${baseUrl}/img/no-poster-v.jpg`;
                let posterH = `${baseUrl}/img/no-poster-h.jpg`;
                if (season.poster_v) {
                    posterV = season.poster_v.split('/');
                    posterV = `${baseUrl}/${posterV[0]}/md/${posterV[1]}/${posterV[2]}`;
                }
                if (season.poster_h) {
                    posterH = season.poster_h.split('/');
                    posterH = `${baseUrl}/${posterH[0]}/md/${posterH[1]}/${posterH[2]}`;
                }

                conditions = {
                    season_id: season.season_id,
                    status_delete: 0
                };
                select = [
                    [sequelize.col('episode.uuid'), 'episode_uuid'],
                    [sequelize.col('episode.ep'), 'episode_no'],
                    [sequelize.col('episode.name'), 'episode_name'],
                    [sequelize.col('episode.name_en'), 'episode_name_en'],
                    [sequelize.col('episode.description'), 'description'],
                    [sequelize.col('episode.description_en'), 'description_en'],
                    [sequelize.col('episode.link'), 'link'],
                    [sequelize.col('episode.runtime'), 'runtime'],
                    [sequelize.col('episode.release_date'), 'release_date'],
                    [sequelize.col('episode.is_comingsoon'), 'is_comingsoon'],
                    [sequelize.col('episode.views'), 'views']
                ];
                const episode = await query.findAllByConditions(conditions, Episode, select);

                data = {
                    season_no: season.season_no,
                    series_name: season.series_name,
                    series_name_en: season.series_name_en,
                    poster_v: posterV,
                    poster_h: posterH,
                    title: season.title,
                    title_en: season.title_en,
                    description: season.description,
                    description_en: season.description_en,
                    actors: season.actors,
                    actors_en: season.actors_en,
                    directors: season.directors,
                    directors_en: season.directors_en,
                    authors: season.authors,
                    authors_en: season.authors_en,
                    trailer: season.trailer,
                    release_date: season.release_date,
                    views: season.views,
                    rate: rate,
                    episode: episode
                };

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: data
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        getEpisodeByUuid: async (_, { episodeUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    uuid: episodeUuid,
                    status_delete: 0
                };
                select = [
                    [sequelize.col('episode.uuid'), 'episode_uuid'],
                    [sequelize.col('episode.ep'), 'episode_no'],
                    [sequelize.col('episode.is_comingsoon'), 'is_comingsoon'],
                    [sequelize.col('episode.name'), 'episode_name'],
                    [sequelize.col('episode.name_en'), 'episode_name_en'],
                    [sequelize.col('episode.description'), 'description'],
                    [sequelize.col('episode.description_en'), 'description_en'],
                    [sequelize.col('episode.link'), 'link'],
                    [sequelize.col('episode.runtime'), 'runtime'],
                    [sequelize.col('episode.views'), 'views'],
                    [sequelize.col('episode.release_date'), 'release_date']
                ];
                const episode = await query.findOneByConditions(conditions, Episode, select);
                if (!episode) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: episode
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        }
    },
    Mutation: {
        createSeries: async (_, { input }, { context }) => {
            const seasonNo = input.season_no;
            const seriesName = input.series_name;
            const seriesNameEn = input.series_name_en;
            const title = input.title;
            const titleEn = input.title_en;
            const description = input.description;
            const descriptionEn = input.description_en;
            const actors = input.actors;
            const actorsEn = input.actors_en;
            const directors = input.directors;
            const directorsEn = input.directors_en;
            const authors = input.authors;
            const authorsEn = input.authors_en;
            const trailer = input.trailer;
            const releaseDate = input.release_date;
            const rateId = input.rate_id;
            const categoryListId = input.category_list_id;
            const listCategoryId = categoryListId.split(',');
            const posterV = input.poster_v;
            const listPosterV = posterV.split('|');
            const posterH = input.poster_h;
            const listPosterH = posterH.split('|');

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    type: 1,
                    [Op.or]: {
                        name: { [Op.or]: [seriesName, seriesNameEn] },
                        name_en: { [Op.or]: [seriesName, seriesNameEn] },
                        trailer: trailer
                    },
                    customer_id: context.customerId
                };
                select = ['*'];
                const checkSeries = await query.findAllByConditions(conditions, Movie, select);
                if (checkSeries.length > 0) {
                    let duplicate = {
                        name: 0,
                        name_en: 0,
                        trailer: 0,
                    }
                    for (const checkSerie of checkSeries) {
                        if (checkSerie.name === seriesName) duplicate.name = 1;
                        if (checkSerie.name_en === seriesNameEn) duplicate.name_en = 1;
                        if (checkSerie.trailer === trailer) duplicate.trailer = 1;
                    }
                    let messageDuplicate = "";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    if (duplicate.trailer === 1) messageDuplicate = messageDuplicate + " Trailer,";
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);

                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                const seriesUuid = uuidv4();
                const seasonUuid = uuidv4();
                let subPath, fileNameV, fileNameH, generateNameV, generateNameH;
                if (listPosterV.length == 3) {
                    generateNameV = generatePassword(10, false);
                    for (const [index, item] of listPosterV.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seriesUuid.substr(0, 8)}`;
                        fileNameV = `${generateNameV}.${type}`;
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameV}`, imageBuffer);

                        subPath = `movies/${pathSize[index]}/${seasonUuid.substr(0, 8)}`;
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameV}`, imageBuffer);
                    }
                }
                if (listPosterH.length == 3) {
                    generateNameH = generatePassword(10, false);
                    for (const [index, item] of listPosterH.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seriesUuid.substr(0, 8)}`;
                        fileNameH = `${generateNameH}.${type}`;
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameH}`, imageBuffer);

                        subPath = `movies/${pathSize[index]}/${seasonUuid.substr(0, 8)}`;
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameH}`, imageBuffer);
                    }
                }

                data = {
                    uuid: seriesUuid,
                    type: 1,
                    is_comingsoon: 1,
                    name: seriesName,
                    name_en: seriesNameEn,
                    title: title,
                    title_en: titleEn,
                    description: description,
                    description_en: descriptionEn,
                    actors: actors,
                    actors_en: actorsEn,
                    directors: directors,
                    directors_en: directorsEn,
                    authors: authors,
                    authors_en: authorsEn,
                    trailer: trailer,
                    release_date: releaseDate,
                    customer_id: context.customerId,
                    rate_id: rateId,
                    created_by: context.userId
                };
                if (listPosterV.length == 3) data.poster_vertical = `movies/${seriesUuid.substr(0, 8)}/${fileNameV}`;
                if (listPosterH.length == 3) data.poster_horizontal = `movies/${seriesUuid.substr(0, 8)}/${fileNameH}`;
                let createSeries = await Movie.create(data);
                createSeries = createSeries.get({ plain: true });

                data = {
                    movie_id: createSeries.id,
                    uuid: seasonUuid,
                    season_no: seasonNo,
                    title: title,
                    title_en: titleEn,
                    description: description,
                    description_en: descriptionEn,
                    trailer: trailer,
                    release_date: releaseDate,
                    created_by: context.userId
                };
                if (listPosterV.length == 3) data.poster_vertical = `movies/${seasonUuid.substr(0, 8)}/${fileNameV}`;
                if (listPosterH.length == 3) data.poster_horizontal = `movies/${seasonUuid.substr(0, 8)}/${fileNameH}`;
                let createSeason = await Season.create(data);
                createSeason = createSeason.get({ plain: true });

                for (const item of listCategoryId) {
                    data = {
                        movie_id: createSeries.id,
                        category_id: item
                    }
                    await MovieCategory.create(data);
                }

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: {
                            series_uuid: seriesUuid,
                            season_uuid: seasonUuid
                        }
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        updateSeries: async (_, { input }, { context }) => {
            const seriesUuid = input.series_uuid;
            const isComingsoon = input.is_comingsoon;
            const seriesName = input.series_name;
            const seriesNameEn = input.series_name_en;
            const title = input.title;
            const titleEn = input.title_en;
            const description = input.description;
            const descriptionEn = input.description_en;
            const actors = input.actors;
            const actorsEn = input.actors_en;
            const directors = input.directors;
            const directorsEn = input.directors_en;
            const authors = input.authors;
            const authorsEn = input.authors_en;
            const trailer = input.trailer;
            const releaseDate = input.release_date;
            const rateId = input.rate_id;
            const categoryListId = input.category_list_id;
            const listCategoryId = categoryListId.split(',');
            const posterV = input.poster_v;
            const listPosterV = posterV.split('|');
            const posterH = input.poster_h;
            const listPosterH = posterH.split('|');

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seriesUuid,
                    customer_id: context.customerId
                };
                select = ['*'];
                const oldSeries = await query.findOneByConditions(conditions, Movie, select);
                if (!oldSeries) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    movie_id: oldSeries.id
                };
                const checkCategory = await query.findAllByConditions(conditions, MovieCategory);

                let checkListCategoryId = [];
                for (const item of checkCategory) {
                    checkListCategoryId.push(item.category_id);
                }
                const compareCategory = await functions.compareArrayNumber(listCategoryId, checkListCategoryId);

                if (
                    oldSeries.is_comingsoon == isComingsoon && oldSeries.name == seriesName && oldSeries.name_en == seriesNameEn &&
                    oldSeries.title == title && oldSeries.title_en == titleEn && oldSeries.description == description &&
                    oldSeries.description_en == descriptionEn && oldSeries.actors == actors && oldSeries.actors_en == actorsEn &&
                    oldSeries.directors == directors && oldSeries.directors_en == directorsEn && oldSeries.authors == authors &&
                    oldSeries.authors_en == authorsEn && oldSeries.trailer == trailer && oldSeries.release_date == releaseDate &&
                    oldSeries.rate_id == rateId && compareCategory && listPosterV.length != 3 && listPosterH.length != 3
                ) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }

                /*                 console.log("oldSeries")
                                console.log(oldSeries)
                                let isaActive_comingsoon = 1;
                                conditions = {
                                    status_delete: 0,
                                    movie_id: oldSeries.id
                                };
                                select = ['id'];
                                const seasonId = await query.findAllByConditions(conditions, Season, select);
                                if (seasonId.length > 0) {
                                    for (const item of seasonId) {
                                        conditions = {
                                            status_delete: 0,
                                            season_id: item.id,
                                            is_comingsoon: 0
                                        }
                                        const count = await query.countDataRows(conditions, Episode)
                                        if (count > 0) isaActive_comingsoon = 0;
                                    }
                                }
                                console.log(isaActive_comingsoon)
                                if(isaActive_comingsoon===0){
                                    return {
                                        status: {
                                            code: 2,
                                            message: ""
                                        },
                                        result: {}
                                    };
                                } */




                conditions = {
                    status_delete: 0,
                    type: 1,
                    [Op.or]: {
                        name: { [Op.or]: [seriesName, seriesNameEn] },
                        name_en: { [Op.or]: [seriesName, seriesNameEn] },
                        trailer: trailer
                    },
                    customer_id: context.customerId,
                    uuid: { [Op.ne]: seriesUuid }
                };
                select = ['*'];
                const checkSeries = await query.findAllByConditions(conditions, Movie, select);
                if (checkSeries.length > 0) {
                    let duplicate = {
                        name: 0,
                        name_en: 0,
                        trailer: 0,
                    }
                    for (const checkSerie of checkSeries) {
                        if (checkSerie.name === seriesName) duplicate.name = 1;
                        if (checkSerie.name_en === seriesNameEn) duplicate.name_en = 1;
                        if (checkSerie.trailer === trailer) duplicate.trailer = 1;
                    }

                    let messageDuplicate = "";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    if (duplicate.trailer === 1) messageDuplicate = messageDuplicate + " Trailer,";
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);

                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }

                let subPath, fileNameV, fileNameH, generateNameV, generateNameH;
                if (listPosterV.length == 3) {
                    generateNameV = generatePassword(10, false);
                    for (const [index, item] of listPosterV.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seriesUuid.substr(0, 8)}`;
                        fileNameV = `${generateNameV}.${type}`;
                        if (oldSeries.poster_vertical) {
                            let oldPosterV = oldSeries.poster_vertical.split('/');
                            oldPosterV = `${oldPosterV[0]}/${pathSize[index]}/${oldPosterV[1]}/${oldPosterV[2]}`; // movies/size/uuid/filename
                            fs.unlinkSync(`${rootPath}/${oldPosterV}`);
                        }
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameV}`, imageBuffer);
                    }
                }
                if (listPosterH.length == 3) {
                    generateNameH = generatePassword(10, false);
                    for (const [index, item] of listPosterH.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seriesUuid.substr(0, 8)}`;
                        fileNameH = `${generateNameH}.${type}`;
                        if (oldSeries.poster_horizontal) {
                            let oldPosterH = oldSeries.poster_horizontal.split('/');
                            oldPosterH = `${oldPosterH[0]}/${pathSize[index]}/${oldPosterH[1]}/${oldPosterH[2]}`; // movies/size/uuid/filename
                            fs.unlinkSync(`${rootPath}/${oldPosterH}`);
                        }
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameH}`, imageBuffer);
                    }
                }

                data = {
                    is_comingsoon: isComingsoon,
                    name: seriesName,
                    name_en: seriesNameEn,
                    title: title,
                    title_en: titleEn,
                    description: description,
                    description_en: descriptionEn,
                    actors: actors,
                    actors_en: actorsEn,
                    directors: directors,
                    directors_en: directorsEn,
                    authors: authors,
                    authors_en: authorsEn,
                    trailer: trailer,
                    release_date: releaseDate,
                    rate_id: rateId,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                if (listPosterV.length == 3) data.poster_vertical = `movies/${seriesUuid.substr(0, 8)}/${fileNameV}`;
                if (listPosterH.length == 3) data.poster_horizontal = `movies/${seriesUuid.substr(0, 8)}/${fileNameH}`;

                await Movie.update(data, { where: { uuid: seriesUuid } });
                await MovieCategory.destroy({ where: { movie_id: oldSeries.id } });

                for (const item of listCategoryId) {
                    data = {
                        movie_id: oldSeries.id,
                        category_id: item
                    };
                    await MovieCategory.create(data);
                }

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        deleteSeries: async (_, { seriesUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        }
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seriesUuid,
                    customer_id: context.customerId
                };
                const checkSeries = await query.countDataRows(conditions, Movie);
                if (checkSeries == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                data = {
                    status_delete: 1,
                    deleted_by: context.userId,
                    deleted_at: functions.dateTimeNow()
                };
                await Movie.update(data, { where: { uuid: seriesUuid } });

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    }
                };
            }
        },
        createSeason: async (_, { input }, { context }) => {
            const seriesUuid = input.series_uuid;
            const seasonNo = input.season_no;
            const title = input.title;
            const titleEn = input.title_en;
            const description = input.description;
            const descriptionEn = input.description_en;
            const trailer = input.trailer;
            const releaseDate = input.release_date;
            const posterV = input.poster_v;
            const listPosterV = posterV.split('|');
            const posterH = input.poster_h;
            const listPosterH = posterH.split('|');

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    type: 1,
                    uuid: seriesUuid,
                    customer_id: context.customerId
                };
                select = ['id'];
                const series = await query.findOneByConditions(conditions, Movie, select);
                if (!series) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                join = [
                    { model: Movie, where: conditions, attributes: [], require: true }
                ];

                conditions = {
                    status_delete: 0,
                    movie_id: series.id,
                    [Op.or]: {
                        season_no: seasonNo,
                        trailer: trailer
                    }
                };
                select = ['season_no', 'trailer'];
                const checkSeasons = await query.findAllByConditions(conditions, Season, select);
                console.log(checkSeasons);
                if (checkSeasons.length > 0) {
                    let duplicate = {
                        season_no: 0,
                        trailer: 0
                    };

                    for (const checkSeason of checkSeasons) {
                        if (checkSeason.season_no === seasonNo) duplicate.season_no = 1;
                        if (checkSeason.trailer === trailer) duplicate.trailer = 1;
                    }

                    let messageDuplicate = "";
                    if (duplicate.season_no === 1) messageDuplicate = messageDuplicate + " SeasonNo,";
                    if (duplicate.trailer === 1) messageDuplicate = messageDuplicate + " Trailer,";
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);

                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }


                const seasonUuid = uuidv4();
                let subPath, fileNameV, fileNameH, generateNameV, generateNameH;
                if (listPosterV.length == 3) {
                    generateNameV = generatePassword(10, false);
                    for (const [index, item] of listPosterV.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seasonUuid.substr(0, 8)}`;
                        fileNameV = `${generateNameV}.${type}`;
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameV}`, imageBuffer);
                    }
                }
                if (listPosterH.length == 3) {
                    generateNameH = generatePassword(10, false);
                    for (const [index, item] of listPosterH.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seasonUuid.substr(0, 8)}`;
                        fileNameH = `${generateNameH}.${type}`;
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameH}`, imageBuffer);
                    }
                }

                data = {
                    movie_id: series.id,
                    uuid: seasonUuid,
                    season_no: seasonNo,
                    title: title,
                    title_en: titleEn,
                    description: description,
                    description_en: descriptionEn,
                    trailer: trailer,
                    release_date: releaseDate,
                    created_by: context.userId
                };
                if (listPosterV.length == 3) data.poster_vertical = `movies/${seasonUuid.substr(0, 8)}/${fileNameV}`;
                if (listPosterH.length == 3) data.poster_horizontal = `movies/${seasonUuid.substr(0, 8)}/${fileNameH}`;
                await Season.create(data);

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: {
                            season_uuid: seasonUuid
                        }
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    }
                };
            }
        },
        updateSeason: async (_, { input }, { context }) => {
            const seasonUuid = input.season_uuid;
            const seasonNo = input.season_no;
            const title = input.title;
            const titleEn = input.title_en;
            const description = input.description;
            const descriptionEn = input.description_en;
            const trailer = input.trailer;
            const releaseDate = input.release_date;
            const posterV = input.poster_v;
            const listPosterV = posterV.split('|');
            const posterH = input.poster_h;
            const listPosterH = posterH.split('|');

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        }
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seasonUuid
                };
                select = ['*'];
                const oldSeason = await query.findOneByConditions(conditions, Season, select);
                if (!oldSeason) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                /*    console.log("listPosterH")
                   console.log(listPosterH)
                   console.log("listPosterV")
                   console.log(listPosterV) */

                if (
                    oldSeason.season_no == seasonNo && oldSeason.title == title && oldSeason.title_en == titleEn &&
                    oldSeason.description == description && oldSeason.description_en == descriptionEn &&
                    oldSeason.trailer == trailer && oldSeason.release_date == releaseDate && listPosterV.length != 3 && listPosterH.length != 3
                ) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }


                conditions = {
                    status_delete: 0,
                    movie_id: oldSeason.movie_id,
                    [Op.or]: {
                        trailer: trailer,
                        season_no: seasonNo,
                    },
                    uuid: { [Op.ne]: seasonUuid }
                };
                select = [
                    [sequelize.col('season.season_no'), 'season_no'],
                    [sequelize.col('season.trailer'), 'trailer'],
                ];
                const checkSeasons = await query.findAllByConditions(conditions, Season, select);

                if (checkSeasons.length > 0) {
                    let duplicate = {
                        season_no: 0,
                        trailer: 0,
                    }
                    for (const item of checkSeasons) {
                        if (item.season_no === seasonNo) duplicate.season_no = 1;
                        if (item.trailer === trailer) duplicate.trailer = 1;
                    }

                    let messageDuplicate = "";
                    if (duplicate.season_no === 1) messageDuplicate = messageDuplicate + " seasonNo,";
                    if (duplicate.trailer === 1) messageDuplicate = messageDuplicate + " Trailer,";
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);

                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }
                let subPath, fileNameV, fileNameH, generateNameV, generateNameH;
                if (listPosterV.length == 3) {
                    generateNameV = generatePassword(10, false);
                    for (const [index, item] of listPosterV.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seasonUuid.substr(0, 8)}`;
                        fileNameV = `${generateNameV}.${type}`;
                        if (oldSeason.poster_vertical) {
                            let oldPosterV = oldSeason.poster_vertical.split('/');
                            oldPosterV = `${oldPosterV[0]}/${pathSize[index]}/${oldPosterV[1]}/${oldPosterV[2]}`; // movies/size/uuid/filename
                            fs.unlinkSync(`${rootPath}/${oldPosterV}`);
                        }
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameV}`, imageBuffer);
                    }
                }
                if (listPosterH.length == 3) {
                    generateNameH = generatePassword(10, false);
                    for (const [index, item] of listPosterH.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${seasonUuid.substr(0, 8)}`;
                        fileNameH = `${generateNameH}.${type}`;
                        if (oldSeason.poster_horizontal) {
                            let oldPosterH = oldSeason.poster_horizontal.split('/');
                            oldPosterH = `${oldPosterH[0]}/${pathSize[index]}/${oldPosterH[1]}/${oldPosterH[2]}`; // movies/size/uuid/filename
                            fs.unlinkSync(`${rootPath}/${oldPosterH}`);
                        }
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameH}`, imageBuffer);
                    }
                }

                data = {
                    season_no: seasonNo,
                    title: title,
                    title_en: titleEn,
                    description: description,
                    description_en: descriptionEn,
                    trailer: trailer,
                    release_date: releaseDate,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                if (listPosterV.length == 3) data.poster_vertical = `movies/${seasonUuid.substr(0, 8)}/${fileNameV}`;
                if (listPosterH.length == 3) data.poster_horizontal = `movies/${seasonUuid.substr(0, 8)}/${fileNameH}`;
                console.log(data)
                await Season.update(data, { where: { uuid: seasonUuid } });

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    }
                };
            }
        },
        deleteSeason: async (_, { seasonUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        }
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seasonUuid
                };
                join = [
                    { model: Movie, where: { status_delete: 0, customer_id: context.customerId }, attributes: [], require: true }
                ];
                const checkSeason = await query.countDataRows(conditions, Season, join);
                if (checkSeason == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                data = {
                    status_delete: 1,
                    deleted_by: context.userId,
                    deleted_at: functions.dateTimeNow()
                };
                await Season.update(data, { where: { uuid: seasonUuid } });

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    }
                };
            }
        },
        createEpisode: async (_, { input }, { context }) => {
            const seriesUuid = input.series_uuid;
            const seasonUuid = input.season_uuid;
            const episodeNo = input.episode_no;
            const isComingsoon = input.is_comingsoon;
            const episodeName = input.episode_name;
            const episodeNameEn = input.episode_name_en;
            const description = input.description;
            const descriptionEn = input.description_en;
            const link = input.link;
            const runTime = input.runtime;
            const releaseDate = input.release_date;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seasonUuid
                };
                select = ['id'];
                const season = await query.findOneByConditions(conditions, Season, select);
                if (!season) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: seriesUuid,
                }
                select = [
                    [sequelize.col('seasons.id'), 'id'],
                ];
                join = [
                    { model: Season, where: { status_delete: 0 }, attributes: [], require: true }
                ];
                const seasonId = await query.findAllByConditions(conditions, Movie, select, join);
                console.log("seasonId")
                console.log(seasonId)
                let checkLink = 0;
                if (seasonId.length > 0) {
                    for (const item of seasonId) {
                        conditions = {
                            status_delete: 0,
                            link: link,
                            season_id: item.id
                        };
                        const countLink = await query.countDataRows(conditions, Episode);
                        if (countLink > 0) checkLink = 1;
                    }
                }
                console.log("checkLink")
                console.log(checkLink)

                conditions = {
                    status_delete: 0,
                    season_id: season.id,
                    [Op.or]: {
                        name: { [Op.or]: [episodeName, episodeName] },
                        name_en: { [Op.or]: [episodeName, episodeNameEn] },
                        link: link,
                        ep: episodeNo
                    }
                };
                select = ['ep', 'name', 'name_en'];
                const checkEpisodes = await query.findAllByConditions(conditions, Episode, select);
                if (checkEpisodes.length > 0 || (checkLink === 1)) {
                    let duplicate = {
                        ep: 0,
                        name: 0,
                        name_en: 0,
                        link: 0
                    };

                    for (const checkEpisode of checkEpisodes) {
                        if (checkEpisode.ep === episodeNo) duplicate.ep = 1;
                        if (checkEpisode.name === episodeName) duplicate.name = 1;
                        if (checkEpisode.name_en === episodeNameEn) duplicate.name_en = 1;
                    }

                    let messageDuplicate = "";
                    if (duplicate.ep === 1) messageDuplicate = messageDuplicate + " Ep No,";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    if (checkLink === 1) {
                        messageDuplicate = messageDuplicate + " Link,";
                        duplicate.link = 1;
                    }
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);

                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };
                }


                data = {
                    uuid: uuidv4(),
                    season_id: season.id,
                    ep: episodeNo,
                    name: episodeName,
                    name_en: episodeNameEn,
                    description: description,
                    description_en: descriptionEn,
                    link: link,
                    runtime: runTime,
                    release_date: releaseDate,
                    is_comingsoon: isComingsoon,
                    created_by: context.userId
                };
                await Episode.create(data);


                if (isComingsoon === 0) {
                    conditions = {
                        status_delete: 0,
                        uuid: seriesUuid
                    };
                    select = ['id']
                    const movieId = await query.findOneByConditions(conditions, Movie, select);
                    console.log("movieId")
                    console.log(movieId)

                    conditions = {
                        status_delete: 0,
                        movie_id: movieId.id
                    };
                    const count = await query.countDataRows(conditions, Season);
                    console.log("count")
                    console.log(count)
                    if (count === 1) {
                        data = {
                            is_comingsoon: 0,
                        };
                        await Movie.update(data, { where: { uuid: seriesUuid } });
                    }
                }

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {}
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        updateEpisode: async (_, { input }, { context }) => {
            const seriesUuid = input.series_uuid;
            const episodeUuid = input.episode_uuid;
            const episodeNo = input.episode_no;
            const episodeName = input.episode_name;
            const episodeNameEn = input.episode_name_en;
            const description = input.description;
            const descriptionEn = input.description_en;
            const link = input.link;
            const runTime = input.runtime;
            const isComingsoon = input.is_comingsoon;
            const releaseDate = input.release_date;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: episodeUuid
                };
                select = ['*'];
                const oldEpisode = await query.findOneByConditions(conditions, Episode, select);
                if (!oldEpisode) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                if (
                    oldEpisode.name == episodeName && oldEpisode.name_en == episodeNameEn && oldEpisode.ep == episodeNo &&
                    oldEpisode.description == description && oldEpisode.description_en == descriptionEn && oldEpisode.link == link &&
                    oldEpisode.runtime == runTime && oldEpisode.is_comingsoon == isComingsoon && oldEpisode.release_date == releaseDate
                ) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }



                conditions = {
                    status_delete: 0,
                    uuid: seriesUuid,
                }
                select = [
                    [sequelize.col('seasons.id'), 'id'],
                ];
                join = [
                    { model: Season, where: { status_delete: 0 }, attributes: [], require: true }
                ];
                const seasonId = await query.findAllByConditions(conditions, Movie, select, join);
                console.log("seasonId")
                console.log(seasonId)
                let checkLink = 0;
                if (seasonId.length > 0) {
                    for (const item of seasonId) {
                        conditions = {
                            status_delete: 0,
                            link: link,
                            season_id: item.id,
                            uuid: { [Op.ne]: episodeUuid }
                        };
                        const countLink = await query.countDataRows(conditions, Episode);
                        console.log("countLink 1")
                        console.log(countLink)
                        if (countLink > 0) checkLink = 1;
                    }
                }
                console.log("checkLink")
                console.log(checkLink)


                conditions = {
                    status_delete: 0,
                    season_id: oldEpisode.season_id,
                    [Op.or]: {
                        name: { [Op.or]: [episodeName, episodeName] },
                        name_en: { [Op.or]: [episodeName, episodeNameEn] },
                        link: link,
                        ep: episodeNo
                    },
                    uuid: { [Op.ne]: episodeUuid }
                };
                select = ['ep', 'name', 'name_en'];
                const checkEpisodes = await query.findAllByConditions(conditions, Episode, select);
                console.log("checkEpisodes")
                console.log(checkEpisodes)
                if (checkEpisodes.length > 0 || (checkLink === 1)) {
                    let duplicate = {
                        ep: 0,
                        name: 0,
                        name_en: 0,
                        link: 0,
                    };

                    for (const checkEpisode of checkEpisodes) {
                        if (checkEpisode.ep === episodeNo) duplicate.ep = 1;
                        if (checkEpisode.name === episodeName) duplicate.name = 1;
                        if (checkEpisode.name_en === episodeNameEn) duplicate.name_en = 1;
                    }

                    let messageDuplicate = "";
                    if (duplicate.ep === 1) messageDuplicate = messageDuplicate + " Ep No,";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    if (checkLink === 1) {
                        messageDuplicate = messageDuplicate + " Link,";
                        duplicate.link = 1;
                    }
                    messageDuplicate = messageDuplicate.substr(0, messageDuplicate.length - 1);

                    return {
                        status: {
                            code: 2,
                            message: `Duplicate! ${messageDuplicate}`
                        },
                        result: {
                            duplicate: duplicate
                        }
                    };

                }

                data = {
                    name: episodeName,
                    name_en: episodeNameEn,
                    description: description,
                    description_en: descriptionEn,
                    link: link,
                    ep: episodeNo,
                    runtime: runTime,
                    release_date: releaseDate,
                    is_comingsoon: isComingsoon,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                await Episode.update(data, { where: { uuid: episodeUuid } });

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    }
                    ,
                    result: {}
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                    result: {}
                };
            }
        },
        deleteEpisode: async (_, { episodeUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 9) {
                        checkPermission = true;
                        break;
                    }
                }
                if (!checkPermission) {
                    return {
                        status: {
                            code: 2,
                            message: "Permission denied!"
                        }
                    };
                }

                conditions = {
                    status_delete: 0,
                    uuid: episodeUuid
                };
                const checkEpisode = await query.countDataRows(conditions, Episode);
                if (checkEpisode == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                data = {
                    status_delete: 1,
                    deleted_by: context.userId,
                    deleted_at: functions.dateTimeNow()
                };
                await Episode.update(data, { where: { uuid: episodeUuid } });

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    }
                };
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    }
                };
            }
        }
    }
};

module.exports = resolvers;