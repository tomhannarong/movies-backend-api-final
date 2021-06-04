const { gql } = require('apollo-server-express');


const type = gql`
    type status {
        code: Int! ,
        message: String!
    }
    type user {
        user_uuid: String ,
        user_name: String
    }

    type responseGetHelpTopics {
        status: status! ,
        result: resultGetHelpTopics
    }
    type responseGetHelpTopicById{
        status: status! ,
        result: resultGetHelpTopicById
    }
    type responseGetHelpListByTopicId{
        status: status! ,
        result: resultGetHelpListByTopicId
    }
    type responseGetHelpListByListId{
        status: status! ,
        result: resultGetHelpListByListId
    }
    type responseCreateHelpTopic{
        status: status! ,
        result: resultCreateHelpTopic
    }
    type responseUpdateHelpTopic{
        status: status! ,
        result: resultUpdateHelpTopic
    }
    type responseDeleteHelpTopic{
        status: status! ,
    }
    type responseCreateHelpList{
        status: status! ,
        result: resultCreateHelpList
    }
    type responseUpdateHelpList{
        status: status! ,
        result: resultUpdateHelpList
    }
    type responseDeleteHelpList{
        status: status! ,
    }

    type resultGetHelpTopics {
        data: [dataGetHelpTopics]
    }
    type resultGetHelpTopicById {
        data: dataGetHelpTopics
    }
    type resultGetHelpListByTopicId {
        data:[list]
    }
    type resultGetHelpListByListId{
        data:list
    }
    type resultCreateHelpTopic{
        data: dataGetHelpTopics ,
        duplicate: duplicateTopic
    }
    type resultUpdateHelpTopic{
        data: dataGetHelpTopics ,
        duplicate: duplicateTopic
    }
    type resultCreateHelpList{
        data: list ,
        duplicate: duplicateList
    }
    type resultUpdateHelpList{
        data: list ,
        duplicate: duplicateList
    }

    type dataGetHelpTopics {
        id: Int,
        topic: String,
        topic_en: String,
        created_by: user ,
        updated_by: user,
    }
    type list{
        id: Int,
        title: String ,
        title_en: String ,
        description: String ,
        description_en: String ,
        created_by: user ,
        updated_by: user,
    }
    type duplicateTopic{
        topic: Int,
        topic_en: Int,
    }
    type duplicateList{
        title: Int,
        title_en: Int,
        description: Int,
        description_en: Int,
    }

    input createTopic{
        topic: String!,
        topic_en: String!,
    }
    input updateTopic{
        id: Int!,
        topic: String!,
        topic_en: String!,   
    }
    input createHelpList{
        help_topic_id: Int!,
        title: String!,
        title_en: String!,
        description: String!,
        description_en: String!,
    }
    input updateHelpList{
        id : Int!
        help_topic_id: Int!,
        title: String!,
        title_en: String!,
        description: String!,
        description_en: String!,
    }

    type Query {
        getHelpTopics: responseGetHelpTopics,
        getHelpTopicsById(topic_id: Int!): responseGetHelpTopicById,
        getHelpListByTopicId(topic_id: Int!):responseGetHelpListByTopicId,
        getHelpListByListId(list_id: Int!):responseGetHelpListByListId,
    }
    type Mutation {
        createHelpTopic(input: createTopic): responseCreateHelpTopic ,
        updateHelpTopic(input: updateTopic): responseUpdateHelpTopic ,
        deleteHelpTopic(topicId: Int!): responseDeleteHelpTopic,

        createHelpList(input: createHelpList): responseCreateHelpList ,
        updateHelpList(input: updateHelpList): responseUpdateHelpList ,
        deleteHelpList(listId: Int!): responseDeleteHelpList ,

    }
`;

module.exports = type;
