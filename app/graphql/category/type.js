const { gql } = require('apollo-server-express');

const type = gql`
    input create {
        category_name: String! ,
        category_name_en: String!
    }

    input update {
        category_id: ID! ,
        category_name: String! ,
        category_name_en: String!
    }

    type user {
        user_uuid: String ,
        user_name: String
    }

    type status {
        code: Int! ,
        message: String!
    }
    
    type duplicate {
        name: Int ,
        name_en: Int
    }

    type dataGetCategory {
        category_id: ID ,
        category_name: String ,
        category_name_en: String ,
        created_by: user ,
        updated_by: user
    }

    type dataCreateCategory {
        category_id: ID ,
        category_name: String ,
        category_name_en: String ,
        created_by: user
    }

    type dataUpdateCategory {
        category_id: ID ,
        category_name: String ,
        category_name_en: String ,
        updated_by: user
    }

    type resultGetCategory {
        data: [dataGetCategory!]
    }

    type resultCeateCategory {
        data: dataCreateCategory ,
        duplicate: duplicate
    }

    type resultUpdateCategory {
        data: dataUpdateCategory,
        duplicate: duplicate
    }

    type responseGetCategory {
        status: status! ,
        result: resultGetCategory
    }

    type responseCreateCategory {
        status: status! ,
        result: resultCeateCategory
    }

    type responseUpdateCategory {
        status: status! ,
        result: resultUpdateCategory
    }

    type responseDeleteCategory {
        status: status!
    }

    type Query {
        getCategory: responseGetCategory
    }

    type Mutation {
        createCategory(input: create): responseCreateCategory ,
        updateCategory(input: update): responseUpdateCategory ,
        deleteCategory(categoryId: ID): responseDeleteCategory
    }
`;

module.exports = type;