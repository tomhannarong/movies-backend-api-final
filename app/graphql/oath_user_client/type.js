const { gql } = require('apollo-server-express');

const type = gql`
    type result {
        token: String ,
        refresh: String ,
        name: String ,
        avatar: String ,
        menus: [Int] ,
        is_admin: Int ,
        is_active: Boolean
    }

    type status {
        code: Int ,
        message: String
    }

    type response {
        status: status ,
        result: result
    }

    type Query {
        getOathClient(uuid: String): response
    }

    type Mutation {
        createOath: response
    }
`;

module.exports = type;