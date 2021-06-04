const db = require('../../../config/db');
const sequelize = db.sequelize;
const User = db.users;
const Op = db.Sequelize.Op;

const topic = db.help_topics;
const helpList = db.help_lists

const query = require('../../helper/query');
const functions = require('../../helper/functions');

let conditions, select, data, join, order;
let checkPermission = false;

const resolvers = {
    Query: {
        getHelpTopics: async (_, { }, { context }) => {
            const customerId = context.customerId;
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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
                    customer_id: customerId
                };
                select = [
                    [sequelize.col('help_topics.id'), 'id'],
                    [sequelize.col('help_topics.topic'), 'topic'],
                    [sequelize.col('help_topics.topic_en'), 'topic_en'],
                    [sequelize.col('help_topics.created_by'), 'created_by'],
                    [sequelize.col('help_topics.updated_by'), 'updated_by'],
                ];

                const countHelpTopics = await query.countDataRows(conditions, topic);
                if (countHelpTopics === 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                order = [
                    ['updated_at', 'DESC']
                ];

                const dataTopic = await query.findAllByConditions(conditions, topic, select, [], order);
                for (const item of dataTopic) {
                    conditions = {
                        status_delete: 0,
                        id: item.created_by,
                    };
                    select = [
                        [sequelize.col('users.uuid'), 'user_uuid'],
                        [sequelize.col('users.name'), 'user_name']
                    ];
                    const dataCreateby = await query.findOneByConditions(conditions, User, select);
                    item.created_by = dataCreateby;

                    conditions = {
                        status_delete: 0,
                        id: item.updated_by,
                    };
                    const dataUpdateby = await query.findOneByConditions(conditions, User, select);
                    item.updated_by = dataUpdateby;
                }
                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {

                        data: dataTopic
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
        getHelpTopicsById: async (_, { topic_id }, { context }) => {
            const customerId = context.customerId;
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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
                    customer_id: customerId,
                    id: topic_id
                };
                select = [
                    [sequelize.col('help_topics.id'), 'id'],
                    [sequelize.col('help_topics.topic'), 'topic'],
                    [sequelize.col('help_topics.topic_en'), 'topic_en'],
                    [sequelize.col('help_topics.created_by'), 'created_by'],
                    [sequelize.col('help_topics.updated_by'), 'updated_by'],
                ];

                const countHelpTopicsById = await query.countDataRows(conditions, topic);
                if (countHelpTopicsById === 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                const dataTopic = await query.findOneByConditions(conditions, topic, select);
                conditions = {
                    status_delete: 0,
                    id: dataTopic.created_by,
                };
                select = [
                    [sequelize.col('users.uuid'), 'user_uuid'],
                    [sequelize.col('users.name'), 'user_name']
                ];
                const dataCreateby = await query.findOneByConditions(conditions, User, select);
                dataTopic.created_by = dataCreateby;
                conditions = {
                    status_delete: 0,
                    id: dataTopic.updated_by,
                };
                const dataUpdateby = await query.findOneByConditions(conditions, User, select);
                dataTopic.updated_by = dataUpdateby;

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: dataTopic
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
        getHelpListByTopicId: async (_, { topic_id }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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
                    help_topic_id: topic_id
                };
                select = [
                    [sequelize.col('help_lists.id'), 'id'],
                    [sequelize.col('help_lists.title'), 'title'],
                    [sequelize.col('help_lists.title_en'), 'title_en'],
                    [sequelize.col('help_lists.description'), 'description'],
                    [sequelize.col('help_lists.description_en'), 'description_en'],
                    [sequelize.col('help_lists.created_by'), 'created_by'],
                    [sequelize.col('help_lists.updated_by'), 'updated_by'],
                ];

                const countHelpListByTopicId = await query.countDataRows(conditions, helpList);

                if (countHelpListByTopicId === 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                order = [
                    ['updated_at', 'DESC']
                ];

                const dataHelpList = await query.findAllByConditions(conditions, helpList, select, [], order);

                for (const item of dataHelpList) {
                    conditions = {
                        status_delete: 0,
                        id: item.created_by,
                    };
                    select = [
                        [sequelize.col('users.uuid'), 'user_uuid'],
                        [sequelize.col('users.name'), 'user_name']
                    ];
                    const dataCreateby = await query.findOneByConditions(conditions, User, select);
                    item.created_by = dataCreateby;
                    conditions = {
                        status_delete: 0,
                        id: item.updated_by,
                    };
                    const dataUpdateby = await query.findOneByConditions(conditions, User, select);
                    item.updated_by = dataUpdateby;
                }

                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: dataHelpList
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
        getHelpListByListId: async (_, { list_id }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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
                    help_topic_id: list_id
                };
                select = [
                    [sequelize.col('help_lists.id'), 'id'],
                    [sequelize.col('help_lists.title'), 'title'],
                    [sequelize.col('help_lists.title_en'), 'title_en'],
                    [sequelize.col('help_lists.description'), 'description'],
                    [sequelize.col('help_lists.description_en'), 'description_en'],
                    [sequelize.col('help_lists.created_by'), 'created_by'],
                    [sequelize.col('help_lists.updated_by'), 'updated_by'],
                ];

                const countHelpListByListId = await query.countDataRows(conditions, helpList);

                if (countHelpListByListId === 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }

                const dataHelpList = await query.findOneByConditions(conditions, helpList, select);

                conditions = {
                    status_delete: 0,
                    id: dataHelpList.created_by,
                };
                select = [
                    [sequelize.col('users.uuid'), 'user_uuid'],
                    [sequelize.col('users.name'), 'user_name']
                ];
                const dataCreateby = await query.findOneByConditions(conditions, User, select);
                dataHelpList.created_by = dataCreateby;
                conditions = {
                    status_delete: 0,
                    id: dataHelpList.updated_by,
                };
                const dataUpdateby = await query.findOneByConditions(conditions, User, select);
                dataHelpList.updated_by = dataUpdateby;


                return {
                    status: {
                        code: 1,
                        message: "Success"
                    },
                    result: {
                        data: dataHelpList
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

    },
    Mutation: {
        createHelpTopic: async (_, { input }, { context }) => {
            const dataTopic = input.topic;
            const dataTopic_en = input.topic_en;
            const customerId = context.customerId;
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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


                // check limit
                conditions = {
                    status_delete: 0,
                    customer_id: customerId,
                };
                const countHelpTopics = await query.countDataRows(conditions, topic);
                if (countHelpTopics > 4) {
                    return {
                        status: {
                            code: 2,
                            message: 'Max Limit'
                        },
                        result: {}
                    };
                }

                // check duplicate
                conditions = {
                    status_delete: 0,
                    customer_id: customerId,
                    [Op.or]: {
                        topic: { [Op.or]: [dataTopic, dataTopic_en] },
                        topic_en: { [Op.or]: [dataTopic, dataTopic_en] }
                    }
                };
                select = [
                    [sequelize.col('help_topics.topic'), 'topic'],
                    [sequelize.col('help_topics.topic_en'), 'topic_en'],
                ];
                const checkTopics = await query.findAllByConditions(conditions, topic);
                if (checkTopics.length > 0) {
                    let duplicate = {
                        topic: 0,
                        topic_en: 0
                    };
                    for (const checkTopic of checkTopics) {
                        if (checkTopic.topic == dataTopic) duplicate.topic = 1;
                        if (checkTopic.topic_en == dataTopic_en) duplicate.topic_en = 1;
                    }
                    let messageDuplicate = "";
                    if (duplicate.topic === 1) messageDuplicate = messageDuplicate + " Topic,";
                    if (duplicate.topic_en === 1) messageDuplicate = messageDuplicate + " TopicEng,";
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

                //  INSERT INTO
                data = {
                    customer_id: customerId,
                    topic: dataTopic,
                    topic_en: dataTopic_en,
                    created_by: context.userId
                };
                let createHelpTopic = await topic.create(data);
                createHelpTopic = createHelpTopic.get({ plain: true });
                data = {
                    id: createHelpTopic.id,
                    topic: createHelpTopic.topic,
                    topic_en: createHelpTopic.topic_en,
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
        updateHelpTopic: async (_, { input }, { context }) => {
            const topic_id = input.id;
            const dataTopic = input.topic;
            const dataTopic_en = input.topic_en;
            const customerId = context.customerId;
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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

                // check dataOld 
                conditions = {
                    id: topic_id,
                    status_delete: 0,
                };
                select = ['id', 'topic', 'topic_en'];
                const oldTopic = await query.findOneByConditions(conditions, topic, select);
                if (!oldTopic) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }
                if (oldTopic.topic == dataTopic && oldTopic.topic_en == dataTopic_en) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }

                // check duplicate
                conditions = {
                    status_delete: 0,
                    customer_id: customerId,
                    [Op.or]: {
                        topic: { [Op.or]: [dataTopic, dataTopic_en] },
                        topic_en: { [Op.or]: [dataTopic, dataTopic_en] }
                    },
                    id: { [Op.ne]: topic_id }
                };
                select = [
                    [sequelize.col('help_topics.topic'), 'topic'],
                    [sequelize.col('help_topics.topic_en'), 'topic_en'],
                ];
                const checkTopics = await query.findAllByConditions(conditions, topic);
                if (checkTopics.length > 0) {
                    let duplicate = {
                        topic: 0,
                        topic_en: 0
                    };
                    for (const checkTopic of checkTopics) {
                        if (checkTopic.topic == dataTopic) duplicate.topic = 1;
                        if (checkTopic.topic_en == dataTopic_en) duplicate.topic_en = 1;
                    }
                    let messageDuplicate = "";
                    if (duplicate.topic === 1) messageDuplicate = messageDuplicate + " Topic,";
                    if (duplicate.topic_en === 1) messageDuplicate = messageDuplicate + " TopicEng,";
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

                // update
                data = {
                    topic: dataTopic,
                    topic_en: dataTopic_en,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                await topic.update(data, { where: { id: topic_id } });

                // return data
                data = {
                    id: topic_id,
                    topic: dataTopic,
                    topic_en: dataTopic_en,
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
        deleteHelpTopic: async (_, { topicId }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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

                // checkTopic
                conditions = {
                    status_delete: 0,
                    id: topicId
                };
                const checkTopic = await query.countDataRows(conditions, topic);
                if (checkTopic == 0) {
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
                await topic.update(data, { where: { id: topicId } });
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

        createHelpList: async (_, { input }, { context }) => {
            const topicId = input.help_topic_id;
            const title = input.title;
            const title_en = input.title_en;
            const description = input.description;
            const description_en = input.description_en;
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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

                // check limit
                conditions = {
                    status_delete: 0,
                    help_topic_id: topicId,
                };
                const countHelpLists = await query.countDataRows(conditions, helpList);
                if (countHelpLists > 9) {
                    return {
                        status: {
                            code: 2,
                            message: 'Max Limit'
                        },
                        result: {}
                    };
                }

                // check duplicate
                conditions = {
                    status_delete: 0,
                    help_topic_id: topicId,
                    [Op.or]: {
                        title: { [Op.or]: [title, title_en] },
                        title_en: { [Op.or]: [title, title_en] },
                        description: { [Op.or]: [description, description_en] },
                        description_en: { [Op.or]: [description, description_en] },
                    },
                };
                select = [
                    [sequelize.col('help_lists.title'), 'title'],
                    [sequelize.col('help_lists.title_en'), 'title_en'],
                    [sequelize.col('help_lists.description'), 'description'],
                    [sequelize.col('help_lists.description_en'), 'description_en'],
                ];
                const checkLists = await query.findAllByConditions(conditions, helpList);

                if (checkLists.length > 0) {
                    let duplicate = {
                        title: 0,
                        title_en: 0,
                        description: 0,
                        description_en: 0,
                    };
                    for (const checkList of checkLists) {
                        if (checkList.title == title) duplicate.title = 1;
                        if (checkList.title_en == title_en) duplicate.title_en = 1;
                        if (checkList.description == description) duplicate.description = 1;
                        if (checkList.description_en == description_en) duplicate.description_en = 1;
                    }
                    let messageDuplicate = "";
                    if (duplicate.title === 1) messageDuplicate = messageDuplicate + " Title,";
                    if (duplicate.title_en === 1) messageDuplicate = messageDuplicate + " TitleEng,";
                    if (duplicate.description === 1) messageDuplicate = messageDuplicate + " Description,";
                    if (duplicate.description_en === 1) messageDuplicate = messageDuplicate + " DescriptionEng,";
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

                //  INSERT INTO
                data = {
                    help_topic_id: topicId,
                    title: title,
                    title_en: title_en,
                    description: description,
                    description_en: description_en,
                    created_by: context.userId,
                };
                let createHelpList = await helpList.create(data);
                createHelpList = createHelpList.get({ plain: true });

                //return
                data = {
                    id: createHelpList.id,
                    title: createHelpList.title,
                    title_en: createHelpList.title_en,
                    description: createHelpList.description,
                    description_en: createHelpList.description_en,
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
        updateHelpList: async (_, { input }, { context }) => {
            const topicId = input.help_topic_id;
            const title = input.title;
            const title_en = input.title_en;
            const description = input.description;
            const description_en = input.description_en;
            const listID = input.id;

            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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

                // check dataOld 
                conditions = {
                    id: listID,
                    status_delete: 0,
                };
                select = ['id', 'title', 'title_en', 'description', 'description_en'];
                const oldList = await query.findOneByConditions(conditions, helpList, select);
                if (!oldList) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        },
                        result: {}
                    };
                }
                if (oldList.title == title && oldList.title_en == title_en &&
                    oldList.description == description && oldList.description_en == description_en
                ) {
                    return {
                        status: {
                            code: 2,
                            message: "No data change!"
                        },
                        result: {}
                    };
                }

                // check duplicate
                conditions = {
                    status_delete: 0,
                    help_topic_id: topicId,
                    [Op.or]: {
                        title: { [Op.or]: [title, title_en] },
                        title_en: { [Op.or]: [title, title_en] },
                        description: { [Op.or]: [description, description_en] },
                        description_en: { [Op.or]: [description, description_en] },
                    },
                    id: { [Op.ne]: listID }
                };
                select = [
                    [sequelize.col('help_lists.title'), 'title'],
                    [sequelize.col('help_lists.title_en'), 'title_en'],
                    [sequelize.col('help_lists.description'), 'description'],
                    [sequelize.col('help_lists.description_en'), 'description_en'],
                ];
                const checkLists = await query.findAllByConditions(conditions, helpList);

                if (checkLists.length > 0) {
                    let duplicate = {
                        title: 0,
                        title_en: 0,
                        description: 0,
                        description_en: 0,
                    };
                    for (const checkList of checkLists) {
                        if (checkList.title == title) duplicate.title = 1;
                        if (checkList.title_en == title_en) duplicate.title_en = 1;
                        if (checkList.description == description) duplicate.description = 1;
                        if (checkList.description_en == description_en) duplicate.description_en = 1;
                    }
                    let messageDuplicate = "";
                    if (duplicate.title === 1) messageDuplicate = messageDuplicate + " Title,";
                    if (duplicate.title_en === 1) messageDuplicate = messageDuplicate + " TitleEng,";
                    if (duplicate.description === 1) messageDuplicate = messageDuplicate + " Description,";
                    if (duplicate.description_en === 1) messageDuplicate = messageDuplicate + " DescriptionEng,";
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


                //  update
                data = {
                    title: title,
                    title_en: title_en,
                    description: description,
                    description_en: description_en,
                    updated_by: context.userId,
                    updated_at: functions.dateTimeNow()
                };
                await helpList.update(data, { where: { id: listID } });

                // return data
                data = {
                    id: listID,
                    title: title,
                    title_en: title_en,
                    description: description,
                    description_en: description_en,
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
        deleteHelpList: async (_, { listId }, { context }) => {
            try {
                if (context.isAdmin == 1) {
                    checkPermission = true;
                }
                for (const item of context.dataRole) {
                    if (item.id == 10) {
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

                // check HelpList
                conditions = {
                    status_delete: 0,
                    id: listId
                };
                const checkTopic = await query.countDataRows(conditions, helpList);
                if (checkTopic == 0) {
                    return {
                        status: {
                            code: 2,
                            message: "Not found data in database!"
                        }
                    };
                }

                // update
                data = {
                    status_delete: 1,
                    deleted_by: context.userId,
                    deleted_at: functions.dateTimeNow()
                };
                await helpList.update(data, { where: { id: listId } });
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
        }
    }
}
module.exports = resolvers;