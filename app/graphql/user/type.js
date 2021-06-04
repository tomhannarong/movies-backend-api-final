const { gql } = require('apollo-server-express');

const type = gql`
    input getAll {
        keyword: String ,
        page: Int ,
        limit: Int
    }

    input create {
        user_name: String! ,
        avatar: String! ,
        user_email: String! ,
        password: String! ,
        role_id: ID
    }

    input update {
        user_uuid: String! ,
        role_id: Int
    }

    type user {
        user_uuid: String ,
        user_name: String
    }
    
    type role {
        role_id: ID ,
        role_name: String
    }

    type status {
        code: Int! ,
        message: String!
    }

    type duplicate{
        email:Int
    }

    type pagination {
        limit: Int! ,
        previous_page: Int! ,
        current_page: Int! ,
        next_page: Int!
    }

    type dataGetUser {
        user_uuid: String ,
        user_name: String ,
        user_avatar: String ,
        user_email: String ,
        user_is_active :Int ,
        user_role: role ,
        created_by: user ,
        updated_by: user
    }

    type dataCreateUser {
        user_uuid: String ,
        user_name: String ,
        user_avatar: String ,
        user_email: String ,
        user_is_active :Int ,
        user_role: role ,
        created_by: user
    }

    type dataUpdateUser {
        user_uuid: String ,
        user_name: String ,
        user_avatar: String ,
        user_email: String ,
        user_is_active :Int ,
        user_role: role ,
        updated_by: user
    }

    type resultGetUser {
        total: Int ,
        pagination: pagination ,
        data: [dataGetUser]
    }

    type resultCreateUser {
        data: dataCreateUser,
        duplicate: duplicate
    }

    type resultUpdateUser {
        data: dataUpdateUser
    }

    type responseGetUser {
        status: status! ,
        result: resultGetUser
    }

    type responseCreateUser {
        status: status! ,
        result: resultCreateUser
    }

    type responseUpdateUser {
        status: status! ,
        result: resultUpdateUser
    }

    type responseDeleteUser {
        status: status!
    }

    type Query {
        getUser(input: getAll): responseGetUser
    }

    type Mutation {
        createUser(input: create): responseCreateUser ,
        bannedUser(userUuid: String!): responseUpdateUser ,
        updateUser(input: update): responseUpdateUser ,
        deleteUser(userUuid: String!): responseDeleteUser
    }
`;

module.exports = type;