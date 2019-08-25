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
const dotenv = require('dotenv');
dotenv.config();


// import Peeps from "./data/peeps.json";
const Peeps = require("./data/peeps.json");

var app = Express();
const name = process.env.DB_NAME;
const pswd = process.env.DB_PSWD;
// console.log(name, pswd);
Mongoose.connect(`mongodb://${name}:${pswd}@ds263927.mlab.com:63927/scrapery`, { useNewUrlParser: true });

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
        type: PersonType,
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

app.use(Express.json()) // for parsing application/json
app.use(Express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use("/graphql", ExpressGraphQL({
  schema: schema,
  graphiql: true, // If true, presents GraphiQL when the GraphQL endpoint is loaded in a browser
  pretty: true,
}));

app.listen(3000, () => {
  console.log("Hey girl, I'm listening at :3000...",
    // Peeps.Peeps
  );
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

// mutation CreatePerson($firstname: String!, $lastname: String!, $favsong: String) {
//   person(firstname: $firstname, lastname: $lastname, favsong: $favsong) {
//     id,
//       firstname,
//       lastname,
//       favsong
//   }
// }

///CURRENTLY NOT FUNCTIONING
app.post('/addNewUser', (req, res) => {
  console.log(req.body);
  if (req.body.firstname && req.body.lastname && req.body.favsong) {
    let mutation = `{
      person(firstname: ${req.body.firstname}, lastname: ${req.body.lastname}, favsong: ${req.body.favsong}) {
        id,
        firstname,
        lastname,
        favsong
      }
    }
    `;
    graphql(schema, mutation).then(result => {
      console.log(result);
      // return result
      // res.json(result);
    });
  } else {
    console.log("incomplete person");
    return
  }

  //check reference to figure out format
  //make input form on index to figure out adding new obect
  //this is just warm up for adding search to front end 

})

//search 

app.get('/getAllUserz', (req, res) => {
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

