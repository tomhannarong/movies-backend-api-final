const db = require('../../../config/db');
const movie_categories = require('../../models/movie_categories');
const Movie = db.movies;
const Season = db.season;
const Episode = db.episode;

const query = require('../../helper/query');

let conditions, select, join;

const resolvers = {
    Query: {
        getCheckUuid: async (_, { input }, { context }) => {
            /*  
                Array[movie_categories,series,season,ep] 
             */
            try {
                if (input.typeUuid[0]) {
                    const movieUuid = input.uuid[0];

                    conditions = {
                        status_delete: 0,
                        type: 0,
                        customer_id: context.customerId,
                        uuid: movieUuid
                    }
                    const checkMovie = await query.countDataRows(conditions, Movie);
                    if (checkMovie === 1) {
                        return {
                            status: {
                                code: 1,
                                message: "Success"
                            }
                        };
                    } else {
                        return {
                            status: {
                                code: 2,
                                message: "Not found data in database!"
                            }
                        };
                    }
                } else if (input.typeUuid[1]) {
                    const seriesUuid = input.uuid[1];

                    conditions = {
                        status_delete: 0,
                        type: 1,
                        customer_id: context.customerId,
                        uuid: seriesUuid
                    }
                    const checkSeries = await query.countDataRows(conditions, Movie);
                    if (checkSeries === 1) {
                        return {
                            status: {
                                code: 1,
                                message: "Success"
                            }
                        };
                    } else {
                        return {
                            status: {
                                code: 2,
                                message: "Not found data in database!"
                            }
                        };
                    }
                } else if (input.typeUuid[2]) {
                    const seriesUuid = input.uuid[1];
                    const seasonUuid = input.uuid[2];

                    conditions = {
                        status_delete: 0,
                        uuid: seasonUuid
                    };
                    join = [
                        {
                            model: Movie,
                            where: {
                                status_delete: 0,
                                type: 1,
                                customer_id: context.customerId,
                                uuid: seriesUuid,
                            },
                            attributes: [], require: true
                        }
                    ];
                    const ckeckUuid = await query.countDataRows(conditions, Season, join)

                    if (ckeckUuid > 0) {
                        return {
                            status: {
                                code: 1,
                                message: "Success"
                            }
                        };
                    } else {
                        return {
                            status: {
                                code: 2,
                                message: "Not found data in database!"
                            }
                        };
                    }


                } else if (input.typeUuid[3]) {
                    const seriesUuid = input.uuid[1];
                    const seasonUuid = input.uuid[2];
                    const episodeUuid = input.uuid[3];

                    conditions = {
                        status_delete: 0,
                        type: 1,
                        customer_id: context.customerId,
                        uuid: seriesUuid,
                    };
                    select = ['id'];
                    const seriesId = await query.findOneByConditions(conditions, Movie, select);

                    if (seriesId) {
                        conditions = {
                            status_delete: 0,
                            uuid: seasonUuid,
                            movie_id: seriesId.id
                        };
                        join = [{
                            model: Episode,
                            where: {
                                status_delete: 0,
                                uuid: episodeUuid,
                            },
                            attributes: [],
                            require: true
                        }];
                        const ckeckUuid = await query.countDataRows(conditions, Season, join);

                        if (ckeckUuid > 0) {
                            return {
                                status: {
                                    code: 1,
                                    message: "Success"
                                }
                            };
                        } else {
                            return {
                                status: {
                                    code: 2,
                                    message: "Not found data in database!"
                                }
                            };
                        }
                    } else {
                        return {
                            status: {
                                code: 2,
                                message: "Not found data in database!"
                            }
                        };
                    }

                } else {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }
            } catch (error) {
                return {
                    status: {
                        code: 2,
                        message: error
                    },
                };
            }
        },
    }
}
module.exports = resolvers;