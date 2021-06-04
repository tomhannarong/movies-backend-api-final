const { gql } = require('apollo-server-express');

const type = gql`
    type status {
        code: Int! ,
        message: String!
    }

    type select {
        value: ID ,
        label: String 
    }

    type result {
        data: [select]
    }

    type response {
        status: status! ,
        result: result
    }

    type Query {
        getCategoryOption: response ,
        getPackageOption: response ,
        getProvinceOption: response ,
        getAmphureOption(provinceId: Int!): responseAmphure ,
        getRateOption: response ,
        getRoleOption: response ,
        getMenuOption: response,
        getAmphureOptionByPostcode(postcode: Int!):responseAmphureOptionByPostcode,
    }

    type responseAmphure {
        status: status! ,
        result: resultAmphure
    }
    type resultAmphure {
        data: [selectAmphure]
    }
    type selectAmphure {
        value: ID ,
        label: String ,
        postcode: Int
    }

    type responseAmphureOptionByPostcode {
        status: status! ,
        result: resultAmphureOptionByPostcode
    }
    type resultAmphureOptionByPostcode {
        data: dataAmphureOptionByPostcode
    }
    type dataAmphureOptionByPostcode{
        province:province,
        amphure:amphure
    }
    type province{
        id:ID,
        name_th: String,
        name_en: String,
    }
    type amphure{
        id:ID,
        province_id :Int,
        code: String,
        name_th: String,
        name_en: String,
    }
`;

module.exports = type;