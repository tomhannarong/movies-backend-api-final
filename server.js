const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const useragent = require('express-useragent');
const bodyParser = require('body-parser');
const config = require('config');
const cors = require('cors')

const { oathUser } = require('./app/middlewares/oath_user');
const { validateToken } = require('./app/middlewares/validateToken');
const { validateRefresh } = require('./app/middlewares/validateRefresh');

const baseUrl = config.baseUrl;
const PORT = config.port;

const categoryType = require('./app/graphql/category/type');
const categoryResolvers = require('./app/graphql/category/resolvers');
const categoryServer = new ApolloServer({
    typeDefs: categoryType,
    resolvers: categoryResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const customerType = require('./app/graphql/customer/type');
const customerResolvers = require('./app/graphql/customer/resolvers');
const customerServer = new ApolloServer({
    typeDefs: customerType,
    resolvers: customerResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const memberType = require('./app/graphql/member/type');
const memberResolvers = require('./app/graphql/member/resolvers');
const memberServer = new ApolloServer({
    typeDefs: memberType,
    resolvers: memberResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const movieType = require('./app/graphql/movie/type');
const movieResolvers = require('./app/graphql/movie/resolvers');
const movieServer = new ApolloServer({
    typeDefs: movieType,
    resolvers: movieResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const oathType = require('./app/graphql/oath_user_client/type');
const oathResolvers = require('./app/graphql/oath_user_client/resolvers');
const oathServer = new ApolloServer({
    typeDefs: oathType,
    resolvers: oathResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const packageType = require('./app/graphql/package/type');
const packageResolvers = require('./app/graphql/package/resolvers');
const packageServer = new ApolloServer({
    typeDefs: packageType,
    resolvers: packageResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const profileType = require('./app/graphql/profile/type');
const profileResolvers = require('./app/graphql/profile/resolvers');
const profileServer = new ApolloServer({
    typeDefs: profileType,
    resolvers: profileResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const roleType = require('./app/graphql/role/type');
const roleResolvers = require('./app/graphql/role/resolvers');
const roleServer = new ApolloServer({
    typeDefs: roleType,
    resolvers: roleResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const userType = require('./app/graphql/user/type');
const userResolvers = require('./app/graphql/user/resolvers');
const userServer = new ApolloServer({
    typeDefs: userType,
    resolvers: userResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const refreshType = require('./app/graphql/user_refresh_token/type');
const refreshResolvers = require('./app/graphql/user_refresh_token/resolvers');
const refreshServer = new ApolloServer({
    typeDefs: refreshType,
    resolvers: refreshResolvers,
    context: ({ req }) => ({
        refreshId: req.refreshId,
        oathId: req.oathId,
        uuid: req.uuid,
        isActive: req.isActive
    })
});

const selectDropdownType = require('./app/graphql/select_dropdown/type');
const selectDropdownResolvers = require('./app/graphql/select_dropdown/resolvers');
const selectDropdownServer = new ApolloServer({
    typeDefs: selectDropdownType,
    resolvers: selectDropdownResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const seriesType = require('./app/graphql/series/type');
const seriesResolvers = require('./app/graphql/series/resolvers');
const seriesServer = new ApolloServer({
    typeDefs: seriesType,
    resolvers: seriesResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const helpType = require('./app/graphql/help/type');
const helpResolvers = require('./app/graphql/help/resolvers');
const helpServer = new ApolloServer({
    typeDefs: helpType,
    resolvers: helpResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});


const Manage_categorieType = require('./app/graphql/manage_categorie/type');
const Manage_categorieResolvers = require('./app/graphql/manage_categorie/resolvers');
const Manage_categorieServer = new ApolloServer({
    typeDefs: Manage_categorieType,
    resolvers: Manage_categorieResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});



const checkType = require('./app/graphql/check/type');
const checkResolvers = require('./app/graphql/check/resolvers');
const checkServer = new ApolloServer({
    typeDefs: checkType,
    resolvers: checkResolvers,
    context: ({ req }) => ({
        context: req.dataPrivate
    })
});

const app = express();
app.use(cors());

app.use(useragent.express());
app.use(bodyParser.json({ limit: '100mb' })); //get json from body
app.use(express.static('assets'));
app.use(express.static('ud'));

//app.use(query());
app.use('/oath', oathUser, (req, res, next) => { // get state login
    console.log(req.uuid)
    next()
});

app.use('/access', validateRefresh, (req, res, next) => next()); // get token with refresh token
app.use('/category', validateToken, (req, res, next) => next());
app.use('/customer', validateToken, (req, res, next) => next());
app.use('/member', validateToken, (req, res, next) => next());
app.use('/movie', validateToken, (req, res, next) => next());
app.use('/package', validateToken, (req, res, next) => next());
app.use('/profile', validateToken, (req, res, next) => next());
app.use('/role', validateToken, (req, res, next) => next());
app.use('/user', validateToken, (req, res, next) => next());
app.use('/select', validateToken, (req, res, next) => next());
app.use('/series', validateToken, (req, res, next) => next());

app.use('/help', validateToken, (req, res, next) => next());
app.use('/check', validateToken, (req, res, next) => next());
app.use('/manage/home', validateToken, (req, res, next) => next());



categoryServer.applyMiddleware({ app, path: '/category' });
customerServer.applyMiddleware({ app, path: '/customer' });
memberServer.applyMiddleware({ app, path: '/member' });
movieServer.applyMiddleware({ app, path: '/movie' });
oathServer.applyMiddleware({ app, path: '/oath' });
packageServer.applyMiddleware({ app, path: '/package' });
profileServer.applyMiddleware({ app, path: '/profile' });
roleServer.applyMiddleware({ app, path: '/role' });
userServer.applyMiddleware({ app, path: '/user' });
refreshServer.applyMiddleware({ app, path: '/access' });
selectDropdownServer.applyMiddleware({ app, path: '/select' });
seriesServer.applyMiddleware({ app, path: '/series' });

helpServer.applyMiddleware({ app, path: '/help' });
checkServer.applyMiddleware({ app, path: '/check' });
Manage_categorieServer.applyMiddleware({ app, path: '/manage/home' });

app.listen(PORT, () => console.log(`🚀 Server ready at ${baseUrl}`));