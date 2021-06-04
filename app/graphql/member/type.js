const { gql } = require('apollo-server-express');

const type = gql`
    input getAll {
        keyword: String ,
        page: Int ,
        limit: Int
    }

    type package {
        package_uuid: String ,
        package_name: String
    }

    type status {
        code: Int! ,
        message: String!
    }

    type pagination {
        limit: Int! ,
        previous_page: Int! ,
        current_page: Int! ,
        next_page: Int!
    }

    type dataGetMember {
        member_uuid: String ,
        member_name: String ,
        member_email: String ,
        package: package
    }

    type resultGetMember {
        total: Int ,
        pagination: pagination ,
        data: [dataGetMember]
    }

    type responseGetMember {
        status: status! ,
        result: resultGetMember
    }

    type Query {
        getMember(input: getAll): responseGetMember
    }
`;

module.exports = type;