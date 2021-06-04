const { gql } = require('apollo-server-express');

const type = gql`
    type status {
        code: Int! ,
        message: String!
    }
    input checkUuid{
        uuid: [String] ,
        typeUuid : [Boolean] ,
    }

    type responseGetCheckUuid{
        status: status! 
    }
   
    type Query {
        getCheckUuid(input: checkUuid):responseGetCheckUuid,
    }

`;

module.exports = type;