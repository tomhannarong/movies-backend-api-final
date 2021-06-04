const { gql } = require('apollo-server-express');

const type = gql`

    type result {
        token: String ,
        refresh: String ,
        is_active: Boolean ,
        message: String
    }

    type status {
        status: Boolean ,
        message: String
    }

    type response  {
        results: result! ,
        status: status
    }

    type Query {
        getOathClient(uuid: String): response
    }

    type Mutation {
        updateToken: response
    }
`

module.exports = type;


