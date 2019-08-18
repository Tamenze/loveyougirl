const Express = require("express");
const Path = require('path');
const ExpressGraphQL = require("express-graphql");
const Mongoose = require("mongoose");
const {
  graphql,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema
} = require("graphql");

// import Peeps from "./data/peeps.json";
const Peeps = require("./data/peeps.json");

var app = Express();

// Mongoose.connect("mongodb://localhost/thepolyglotdeveloper");
Mongoose.connect("mongodb://tolu:tolutolu3@ds263927.mlab.com:63927/scrapery", { useNewUrlParser: true });

const PersonModel = Mongoose.model("person", {
  firstname: String,
  lastname: String,
  favsong: String,
});

// ADDS JSON DATA TO DB, commented out so it doesnt run everytime i restart server
// PersonModel.insertMany(Peeps.Peeps, (error, docs) => {
//   if (error) { console.log(error) };
// })

const PersonType = new GraphQLObjectType({
  name: "Person",
  fields: {
    id: { type: GraphQLID },
    firstname: { type: GraphQLString },
    lastname: { type: GraphQLString },
    favsong: { type: GraphQLString }
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      people: {
        type: GraphQLList(PersonType),
        resolve: (root, args, context, info) => {
          return PersonModel.find().exec();
        }
      },
      person: {
        type: PersonType,
        args: {
          id: { type: GraphQLNonNull(GraphQLID) }
        },
        resolve: (root, args, context, info) => {
          return PersonModel.findById(args.id).exec();
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      person: {
        type: GraphQLNonNull(PersonType),
        args: {
          firstname: { type: GraphQLNonNull(GraphQLString) },
          lastname: { type: GraphQLNonNull(GraphQLString) },
          favsong: { type: GraphQLString }
        },
        resolve: (root, args, context, info) => {
          var person = new PersonModel(args);
          return person.save();
        }
      }
    }
  })
});

app.use("/graphql", ExpressGraphQL({
  schema: schema,
  graphiql: true
}));

app.listen(3000, () => {
  console.log("Hey girl, I'm listening at :3000...",
    // Peeps.Peeps
  );
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.get('/please', (req, res) => {
  let query = `{
    people{
      id
      firstname
      lastname
      favsong
    }
  }`;
  graphql(schema, query).then(result => {
    // console.log(result);
    // return result
    res.json(result);
  });
})

