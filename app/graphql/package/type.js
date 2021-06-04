const { gql } = require('apollo-server-express');

const type = gql`
    input getAll {
        keyword: String ,
        page: Int ,
        limit: Int
    }
    
    input create {
        package_name: String! ,
        price: Int! ,
        days: Int!,
        max_quality: String!,
        limit_device: Int!,
    }

    input update {
        package_uuid: String! ,
        package_name: String! ,
        price: Int! ,
        days: Int! ,
        max_quality: String!,
        limit_device: Int!,
    }

    type user {
        user_uuid: String ,
        user_name: String
    }

    type status {
        code: Int! ,
        message: String!
    }

    type duplicate{
        name:Int,
    }

    type pagination {
        limit: Int! ,
        previous_page: Int! ,
        current_page: Int! ,
        next_page: Int!
    }

    type dataGetPackage {
        package_uuid: String ,
        package_name: String ,
        price: Int ,
        days: Int! ,
        max_quality: String,
        limit_device: Int,
        created_by: user ,
        updated_by: user
    }

    type dataCreatePackage {
        package_uuid: String ,
        package_name: String ,
        price: Int ,
        days: Int! ,
        max_quality: String,
        limit_device: Int,
        created_by: user
    }

    type dataUpdatePackage {
        package_uuid: String ,
        package_name: String ,
        price: Int ,
        days: Int! ,
        max_quality: String,
        limit_device: Int ,
        updated_by: user
    }

    type resultGetPackage {
        total: Int ,
        pagination: pagination ,
        data: [dataGetPackage],
        limit_package: Int,
    }

    type resultGetPackageByUuid {
        data: dataGetPackage
    }

    type resultCreatePackage {
        data: dataCreatePackage,
        duplicate: duplicate
    }

    type resultUpdatePackage {
        data: dataUpdatePackage,
        duplicate: duplicate
    }

    type responseGetPackage {
        status: status! ,
        result: resultGetPackage
    }

    type responseGetPackageByUuid {
        status: status! ,
        result: resultGetPackageByUuid
    }

    type responseCreatePackage {
        status: status! ,
        result: resultCreatePackage
    }

    type responseUpdatePackage {
        status: status! ,
        result: resultUpdatePackage
    }

    type responseDeletePackage {
        status: status!
    }

    type Query {
        getPackage(input: getAll): responseGetPackage ,
        getPackageByUuid(packageUuid: String): responseGetPackageByUuid
    }

    type Mutation {
        createPackage(input: create): responseCreatePackage ,
        updatePackage(input: update): responseUpdatePackage ,
        deletePackage(packageUuid: String): responseDeletePackage
    }
`;

module.exports = type;