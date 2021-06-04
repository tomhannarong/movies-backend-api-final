const { gql } = require('apollo-server-express');

const type = gql`
    input getAll {
        keyword: String ,
        page: Int ,
        limit: Int
    }

    input create {
        customer_name: String! ,
        domain: String! ,
        ip_address: String! ,
        tel: String! ,
        address: String! ,
        limit_package: Int!,
        province_id: Int! ,
        amphure_id: Int! ,
        user_name: String! ,
        avatar: String! ,
        email: String! ,
        password: String!
    }

    input update {
        customer_uuid: String! ,
        customer_name: String! ,
        domain: String! ,
        ip_address: String! ,
        tel: String! ,
        address: String! ,
        limit_package: Int!,
        province_id: Int! ,
        amphure_id: Int!
    }

    type user {
        user_uuid: String ,
        user_name: String
    }

    type province {
        province_id: ID ,
        province_name: String ,
        province_name_en: String
    }

    type amphure {
        amphure_id: ID ,
        amphure_name: String ,
        amphure_name_en: String,
        amphure_postcode: Int
    }

    type status {
        code: Int! ,
        message: String!
    }
    
    type duplicate{
        customer_name: Int ,
        domain: Int ,
        ip_address: Int ,   
        email: Int ,
    }

    type pagination {
        limit: Int! ,
        previous_page: Int! ,
        current_page: Int! ,
        next_page: Int!
    }

    type dataGetCustomer {
        customer_uuid: String ,
        customer_name: String ,
        domain: String ,
        ip_address: String ,
        tel: String ,
        address: String ,
        limit_package: Int,
        province: province ,
        amphure: amphure ,
        created_by: user ,
        updated_by: user
    }

    type dataCreateCustomer {
        customer_uuid: String ,
        customer_name: String ,
        domain: String ,
        ip_address: String ,
        tel: String ,
        address: String ,
        limit_package: Int,
        province: province ,
        amphure: amphure ,
        created_by: user
    }

    type dataUpdateCustomer {
        customer_uuid: String ,
        customer_name: String ,
        domain: String ,
        ip_address: String ,
        tel: String ,
        address: String ,
        limit_package: Int ,
        province: province ,
        amphure: amphure ,
        updated_by: user
    }

    type resultGetCustomer {
        total: Int ,
        pagination: pagination ,
        data: [dataGetCustomer]
    }

    type resultGetCustomerByUuid {
        data: dataGetCustomer,
        
    }

    type resultCreateCustomer {
        data: dataCreateCustomer,
        duplicate: duplicate
    }

    type resultUpdateCustomer {
        data: dataUpdateCustomer,
        duplicate: duplicate
    }

    type responseGetCustomer {
        status: status! ,
        result: resultGetCustomer
    }

    type responseGetCustomerByUuid {
        status: status! ,
        result: resultGetCustomerByUuid
    }

    type responseCreateCustomer {
        status: status! ,
        result: resultCreateCustomer
    }

    type responseUpdateCustomer {
        status: status! ,
        result: resultUpdateCustomer
    }

    type responseDeleteCustomer {
        status: status!
    }

    type Query {
        getCustomer(input: getAll): responseGetCustomer ,
        getCustomerByUuid(customerUuid: String): responseGetCustomerByUuid
    }

    type Mutation {
        createCustomer(input: create): responseCreateCustomer ,
        updateCustomer(input: update): responseUpdateCustomer ,
        deleteCustomer(customerUuid: String!): responseDeleteCustomer
    }
`;

module.exports = type;