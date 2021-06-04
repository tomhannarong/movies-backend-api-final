const { gql } = require('apollo-server-express');

const type = gql`
    input update {
        user_uuid: String! ,
        user_name: String! ,
        avatar: String
    }

    input changePassword {
        user_uuid: String! ,
        old_password: String! ,
        new_password: String!
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
        equalPassword :Int,
        oldPassword :Int
    }

    type dataGetProfile {
        user_uuid: String ,
        user_name: String ,
        user_avatar: String ,
        user_email: String ,
        user_role: role ,
        customer_name: String ,
        customer_domain: String ,
        customer_address: String
    }

    type dataUpdateProfile {
        user_name: String ,
        user_avatar: String
    }

    type responseGetProfile {
        status: status! ,
        result: dataGetProfile
    }

    type responseUpdateProfile {
        status: status! ,
        result: dataUpdateProfile
    }

    type responseChangePassword {
        status: status!
        result: resultChangePassword
    }

    type resultChangePassword{
        duplicate:duplicate
    }

    type Query {
        getProfile: responseGetProfile
    }

    type Mutation {
        updateProfile(input: update): responseUpdateProfile ,
        changePassword(input: changePassword): responseChangePassword
    }
`;

module.exports = type;