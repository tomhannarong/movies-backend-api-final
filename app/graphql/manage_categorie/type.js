const { gql } = require('apollo-server-express');

const type = gql`

    type status {
        code: Int! ,
        message: String!
    }

    type dataCategories{
        category_id: String,
        category_name: String,
        category_name_en: String,
    }

    type resultGetManageHomeCategories {
        dataShow:[dataCategories] ,
        dataHidden:[dataCategories]
    }
    type resultGetManageHomeCategoriesByName {
        dataShow:[dataCategories] ,
        dataHidden:[dataCategories]
    }

    type responseGetManageHomeCategories {
        status: status! ,
        result: resultGetManageHomeCategories
    }
    type rvesponseGetManageHomeCategoriesByName{
        status: status! ,
        result: resultGetManageHomeCategoriesByName
    }

    type responseUpdateManageHomeCategories{
        status: status! ,
    }

    type Query {
        getManageHomeCategories : responseGetManageHomeCategories ,
        getManageHomeCategoriesByName(name: String!):rvesponseGetManageHomeCategoriesByName

    }
    type Mutation {
        updateManageHomeCategories(categoriesId: [Int]!):  responseUpdateManageHomeCategories
    }
`;

module.exports = type;