const db = require('../../../config/db');
const Op = db.Sequelize.Op;
const sequelize = db.sequelize;
const Movie = db.movies;
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

let conditions, select, join, order, data;
let page = 1;
let limit = 10;
let checkPermission = false;

const resolvers = {
    Query: {
        getMovie: async (_, { input }, { context }) => {
            if (input.page) page = input.page;
            if (input.limit) limit = input.limit;
            let keyword = input.keyword;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 3) {
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
                    type: 0,
                    customer_id: context.customerId
                };
                if (keyword) {
                    conditions = {
                        status_delete: 0,
                        type: 0,
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
                    [sequelize.col('movies.id'), 'movie_id'],
                    [sequelize.col('movies.uuid'), 'movie_uuid'],
                    [sequelize.col('movies.name'), 'movie_name'],
                    [sequelize.col('movies.name_en'), 'movie_name_en'],
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
                    [sequelize.col('movies.link'), 'link'],
                    [sequelize.col('movies.trailer'), 'trailer'],
                    [sequelize.col('movies.runtime'), 'runtime'],
                    [sequelize.col('movies.is_comingsoon'), 'is_comingsoon'],
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
                const movies = await query.findAllLimitByConditions(conditions, Movie, select, join, order, page, limit);

                for (const item of movies) {
                    conditions = {
                        movie_id: item.movie_id
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

                    select = [
                        [sequelize.col('package.uuid'), 'package_uuid'],
                        [sequelize.col('package.name'), 'package_name']
                    ];
                    join = [
                        { model: Package, attributes: [], require: true }
                    ];
                    const package = await query.findAllByConditions(conditions, MoviePackage, select, join);

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
                    item.category = category;
                    item.package = package;
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
                        data: movies
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
        getMovieByUuid: async (_, { movieUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 3) {
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
                    uuid: movieUuid,
                    customer_id: context.customerId
                };
                select = [
                    [sequelize.col('movies.id'), 'movie_id'],
                    [sequelize.col('movies.uuid'), 'movie_uuid'],
                    [sequelize.col('movies.name'), 'movie_name'],
                    [sequelize.col('movies.name_en'), 'movie_name_en'],
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
                    [sequelize.col('movies.link'), 'link'],
                    [sequelize.col('movies.trailer'), 'trailer'],
                    [sequelize.col('movies.runtime'), 'runtime'],
                    [sequelize.col('movies.release_date'), 'release_date'],
                    [sequelize.col('movies.is_comingsoon'), 'is_comingsoon'],
                    [sequelize.col('movies.views'), 'views'],
                    [sequelize.col('movies.created_by'), 'created_by'],
                    [sequelize.col('movies.updated_by'), 'updated_by'],
                    [sequelize.col('movies.updated_by'), 'updated_by'],
                    [sequelize.col('rate.id'), 'rate_id'],
                    [sequelize.col('rate.code'), 'rate_code'],
                    [sequelize.col('rate.description'), 'rate_description']
                ];
                join = [
                    { model: Rate, attributes: [], require: true }
                ];
                const movie = await query.findOneByConditions(conditions, Movie, select, join);
                if (!movie) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                const optionRate = {
                    value: movie.rate_id,
                    label: `${movie.rate_code}: ${movie.rate_description}`
                };

                conditions = {
                    movie_id: movie.movie_id
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
                if (movie.created_by) {
                    conditions = {
                        status_delete: 0,
                        id: movie.created_by
                    };
                    createdBy = await query.findOneByConditions(conditions, User, select);
                }
                let updatedBy;
                if (movie.updated_by) {
                    conditions = {
                        status_delete: 0,
                        id: movie.updated_by
                    };
                    updatedBy = await query.findOneByConditions(conditions, User, select);
                }

                let posterV = `${baseUrl}/img/no-poster-v.jpg`;
                let posterH = `${baseUrl}/img/no-poster-h.jpg`;
                if (movie.poster_v) {
                    posterV = movie.poster_v.split('/');
                    posterV = `${baseUrl}/${posterV[0]}/md/${posterV[1]}/${posterV[2]}`;
                }
                if (movie.poster_h) {
                    posterH = movie.poster_h.split('/');
                    posterH = `${baseUrl}/${posterH[0]}/md/${posterH[1]}/${posterH[2]}`;
                }

                data = {
                    movie_uuid: movie.movie_uuid,
                    movie_name: movie.movie_name,
                    movie_name_en: movie.movie_name_en,
                    poster_v: posterV,
                    poster_h: posterH,
                    title: movie.title,
                    title_en: movie.title_en,
                    description: movie.description,
                    description_en: movie.description_en,
                    actors: movie.actors,
                    actors_en: movie.actors_en,
                    directors: movie.directors,
                    directors_en: movie.directors_en,
                    authors: movie.authors,
                    authors_en: movie.authors_en,
                    link: movie.link,
                    trailer: movie.trailer,
                    runtime: movie.runtime,
                    release_date: movie.release_date,
                    is_comingsoon: movie.is_comingsoon,
                    views: movie.views,
                    rate: {
                        rate_id: movie.rate_id,
                        rate_code: movie.rate_code,
                        rate_description: movie.rate_description
                    },
                    category: category,
                    option_rate: optionRate,
                    option_category: optionCategory,
                    created_by: createdBy,
                    updated_by: updatedBy
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
        }
    },
    Mutation: {
        createMovie: async (_, { input }, { context }) => {
            const isComingsoon = input.is_comingsoon
            const movieName = input.movie_name;
            const movieNameEn = input.movie_name_en;
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
            const link = input.link;
            const trailer = input.trailer;
            const runTime = input.runtime;
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
                    if (item.id == 3) {
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
                    type: 0,
                    [Op.or]: {
                        name: { [Op.or]: [movieName, movieNameEn] },
                        name_en: { [Op.or]: [movieName, movieNameEn] },
                        link: link,
                        trailer: trailer
                    },
                    customer_id: context.customerId
                };
                select = ['*'];
                const checkMovies = await query.findAllByConditions(conditions, Movie, select);
                if (checkMovies.length > 0) {
                    let duplicate = {
                        name: 0,
                        name_en: 0,
                        link: 0,
                        trailer: 0,
                    }
                    for (const checkMovie of checkMovies) {
                        if (checkMovie.name === movieName) duplicate.name = 1;
                        if (checkMovie.name_en === movieNameEn) duplicate.name_en = 1;
                        if (checkMovie.link === link) duplicate.link = 1;
                        if (checkMovie.trailer === trailer) duplicate.trailer = 1;
                    }

                    let messageDuplicate = "";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    if (duplicate.link === 1) messageDuplicate = messageDuplicate + " Link,";
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

                const movieUuid = uuidv4();
                let subPath, fileNameV, fileNameH, generateNameV, generateNameH;
                if (listPosterV.length == 3) {
                    generateNameV = generatePassword(10, false);
                    for (const [index, item] of listPosterV.entries()) {
                        const matches = item.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                        const type = matches[1];
                        const imageBuffer = new Buffer(matches[2], 'base64');
                        subPath = `movies/${pathSize[index]}/${movieUuid.substr(0, 8)}`;
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
                        subPath = `movies/${pathSize[index]}/${movieUuid.substr(0, 8)}`;
                        fileNameH = `${generateNameH}.${type}`;
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameH}`, imageBuffer);
                    }
                }

                data = {
                    is_comingsoon: isComingsoon,
                    uuid: movieUuid,
                    name: movieName,
                    name_en: movieNameEn,
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
                    link: link,
                    trailer: trailer,
                    runtime: runTime,
                    release_date: releaseDate,
                    customer_id: context.customerId,
                    rate_id: rateId,
                    created_by: context.userId
                }
                if (listPosterV.length == 3) data.poster_vertical = `movies/${movieUuid.substr(0, 8)}/${fileNameV}`;
                if (listPosterH.length == 3) data.poster_horizontal = `movies/${movieUuid.substr(0, 8)}/${fileNameH}`;
                let createMovie = await Movie.create(data);
                createMovie = createMovie.get({ plain: true });

                for (const item of listCategoryId) {
                    data = {
                        movie_id: createMovie.id,
                        category_id: item
                    }
                    await MovieCategory.create(data);
                }


                conditions = {
                    id: rateId
                };
                select = [
                    [sequelize.col('rates.id'), 'rate_id'],
                    [sequelize.col('rates.code'), 'rate_code'],
                    [sequelize.col('rates.description'), 'rate_description']
                ];
                const rate = await query.findOneByConditions(conditions, Rate, select);

                conditions = {
                    id: {
                        [Op.in]: listCategoryId
                    }
                };
                select = [
                    [sequelize.col('categories.id'), 'category_id'],
                    [sequelize.col('categories.name'), 'category_name'],
                    [sequelize.col('categories.name_en'), 'category_name_en']
                ];
                const category = await query.findAllByConditions(conditions, Category, select);

                data = {
                    is_comingsoon: isComingsoon,
                    movie_uuid: createMovie.uuid,
                    movie_name: movieName,
                    movie_name_en: movieNameEn,
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
                    link: link,
                    trailer: trailer,
                    runtime: runTime,
                    release_date: releaseDate,
                    rate: rate,
                    category: category,
                    created_by: {
                        user_uuid: context.userUuid,
                        user_name: context.userName
                    }
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
        updateMovie: async (_, { input }, { context }) => {
            const isComingsoon = input.is_comingsoon
            const movieUuid = input.movie_uuid;
            const movieName = input.movie_name;
            const movieNameEn = input.movie_name_en;
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
            const link = input.link;
            const trailer = input.trailer;
            const runTime = input.runtime;
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
                    if (item.id == 3) {
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
                    uuid: movieUuid,
                    customer_id: context.customerId
                };
                select = ['*'];
                const oldMovie = await query.findOneByConditions(conditions, Movie, select);
                console.log(oldMovie);
                if (!oldMovie) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                conditions = {
                    movie_id: oldMovie.id
                };
                const checkCategory = await query.findAllByConditions(conditions, MovieCategory);

                let checkListCategoryId = [];
                for (const item of checkCategory) {
                    checkListCategoryId.push(item.category_id);
                }
                const compareCategory = await functions.compareArrayNumber(listCategoryId, checkListCategoryId);

                if (oldMovie.is_comingsoon == isComingsoon &&
                    oldMovie.name == movieName && oldMovie.name_en == movieNameEn && oldMovie.title == title &&
                    oldMovie.title_en == titleEn && oldMovie.description == description && oldMovie.description_en == descriptionEn &&
                    oldMovie.actors == actors && oldMovie.actors_en == actorsEn && oldMovie.directors == directors &&
                    oldMovie.directors_en == directorsEn && oldMovie.authors == authors && oldMovie.authors_en == authorsEn &&
                    oldMovie.link == link && oldMovie.trailer == trailer && oldMovie.runtime == runTime && oldMovie.release_date == releaseDate &&
                    oldMovie.rate_id == rateId && compareCategory && listPosterV.length != 3 && listPosterH.length != 3
                ) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }
                console.log("oldMovie.....")
                console.log(compareCategory)
                console.log(listPosterV.length != 3)
                console.log(listPosterH.length != 3)

                conditions = {
                    status_delete: 0,
                    type: 0,
                    [Op.or]: {
                        name: { [Op.or]: [movieName, movieNameEn] },
                        name_en: { [Op.or]: [movieName, movieNameEn] },
                        link: link,
                        trailer: trailer
                    },
                    customer_id: context.customerId,
                    uuid: { [Op.ne]: movieUuid }
                };

                select = ['*'];
                const checkMovies = await query.findAllByConditions(conditions, Movie, select);
                if (checkMovies.length > 0) {
                    let duplicate = {
                        name: 0,
                        name_en: 0,
                        link: 0,
                        trailer: 0,
                    }
                    for (const checkMovie of checkMovies) {
                        if (checkMovie.name === movieName) duplicate.name = 1;
                        if (checkMovie.name_en === movieNameEn) duplicate.name_en = 1;
                        if (checkMovie.link === link) duplicate.link = 1;
                        if (checkMovie.trailer === trailer) duplicate.trailer = 1;

                    }

                    let messageDuplicate = "";
                    if (duplicate.name === 1) messageDuplicate = messageDuplicate + " Name,";
                    if (duplicate.name_en === 1) messageDuplicate = messageDuplicate + " Name Eng,";
                    if (duplicate.link === 1) messageDuplicate = messageDuplicate + " Link,";
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
                        subPath = `movies/${pathSize[index]}/${movieUuid.substr(0, 8)}`;
                        fileNameV = `${generateNameV}.${type}`;
                        if (oldMovie.poster_vertical) {
                            let oldPosterV = oldMovie.poster_vertical.split('/');
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
                        subPath = `movies/${pathSize[index]}/${movieUuid.substr(0, 8)}`;
                        fileNameH = `${generateNameH}.${type}`;
                        if (oldMovie.poster_horizontal) {
                            let oldPosterH = oldMovie.poster_horizontal.split('/');
                            oldPosterH = `${oldPosterH[0]}/${pathSize[index]}/${oldPosterH[1]}/${oldPosterH[2]}`; // movies/size/uuid/filename
                            fs.unlinkSync(`${rootPath}/${oldPosterH}`);
                        }
                        if (!fs.existsSync(`${rootPath}/${subPath}`)) fs.mkdirSync(`${rootPath}/${subPath}`);
                        fs.writeFileSync(`${rootPath}/${subPath}/${fileNameH}`, imageBuffer);
                    }
                }

                data = {
                    is_comingsoon: isComingsoon,
                    name: movieName,
                    name_en: movieNameEn,
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
                    link: link,
                    trailer: trailer,
                    runtime: runTime,
                    release_date: releaseDate,
                    rate_id: rateId,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                console.log(data);
                if (listPosterV.length == 3) data.poster_vertical = `movies/${movieUuid.substr(0, 8)}/${fileNameV}`;
                if (listPosterH.length == 3) data.poster_horizontal = `movies/${movieUuid.substr(0, 8)}/${fileNameH}`;

                await Movie.update(data, { where: { uuid: movieUuid } });
                await MovieCategory.destroy({ where: { movie_id: oldMovie.id } });

                for (const item of listCategoryId) {
                    data = {
                        movie_id: oldMovie.id,
                        category_id: item
                    };
                    await MovieCategory.create(data);
                }

                conditions = {
                    id: rateId
                };
                select = [
                    [sequelize.col('rates.id'), 'rate_id'],
                    [sequelize.col('rates.code'), 'rate_code'],
                    [sequelize.col('rates.description'), 'rate_description']
                ];
                const rate = await query.findOneByConditions(conditions, Rate, select);

                conditions = {
                    id: {
                        [Op.in]: listCategoryId
                    }
                };
                select = [
                    [sequelize.col('categories.id'), 'category_id'],
                    [sequelize.col('categories.name'), 'category_name'],
                    [sequelize.col('categories.name_en'), 'category_name_en']
                ];
                const category = await query.findAllByConditions(conditions, Category, select);


                data = {
                    is_comingsoon: isComingsoon,
                    movie_uuid: movieUuid,
                    movie_name: movieName,
                    movie_name_en: movieNameEn,
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
                    link: link,
                    trailer: trailer,
                    runtime: runTime,
                    release_date: releaseDate,
                    rate: rate,
                    category: category,
                    updated_by: {
                        user_uuid: context.userUuid,
                        user_name: context.userName
                    }
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
        deleteMovie: async (_, { movieUuid }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 3) {
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
                    uuid: movieUuid,
                    customer_id: context.customerId
                };
                const checkMovie = await query.countDataRows(conditions, Movie);
                if (checkMovie == 0) {
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
                await Movie.update(data, { where: { uuid: movieUuid } });

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