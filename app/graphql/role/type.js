const { gql } = require('apollo-server-express');

const type = gql`
    input create {
        role_name: String! ,
        list_impose_menu_id: String!
    }

    input update {
        role_id: ID ,
        role_name: String! ,
        list_impose_menu_id: String!
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

    type permissions {
        impose_menu_id: ID ,
        menu: String
    }

    type dataGetRole {
        role_id: ID ,
        role_name: String ,
        permissions: [permissions] ,
        created_by: user ,
        updated_by: user
    }

    type dataCreateRole {
        role_id: ID ,
        role_name: String ,
        permissions: [permissions] ,
        created_by: user
    }

    type dataUpdateRole {
        role_id: ID ,
        role_name: String ,
        permissions: [permissions] ,
        updated_by: user
    }

    type resultGetRole {
        data: [dataGetRole]
    }

    type resultCreateRole {
        data: dataCreateRole
        duplicate: duplicate
    }

    type resultUpdateRole {
        data: dataUpdateRole,
        duplicate: duplicate
    }

    type responseGetRole {
        status: status! ,
        result: resultGetRole
    }

    type responseCreateRole {
        status: status! ,
        result: resultCreateRole
    }

    type responseUpdateRole {
        status: status! ,
        result: resultUpdateRole
    }

    type responseDeleteRole {
        status: status!
    }

    type Query {
        getRole: responseGetRole
    }

    type Mutation {
        createRole(input: create): responseCreateRole ,
        updateRole(input: update): responseUpdateRole ,
        deleteRole(roleId: ID): responseDeleteRole
    }
`;

module.exports = type;