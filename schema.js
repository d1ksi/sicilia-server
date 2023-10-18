const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    id: ID
    login: String
    address: String
    orders: [Order]
  }
  type Order {
    id: ID
    price: Int
    goods: [Good]
    active: Boolean
  }
  type Menu {
    categories: [Category]
  }
  type Category {
    title: String
    id: ID
    img: String
    goods: [Good]
    active: Boolean 
    subCat: [Subcategories]
  }
  type Subcategories {
    id: ID
    img: String
    title: String
    categories: [Category]
  }
  type Good {
    id: ID
    name: String
    price: Int
    discount: Int
    img: String
    filling: String
    active: Boolean 
  }
  type Goods {
    title: String
    items: [Good]
  }
  type AuthPayload {
    token: String
  }
  input UserInput {
    id: ID
    login: String!
    password: String!
    address: String
    orders: [OrderInput]
  }
  input OrderInput {
    id: ID
    price: Int!
    goods: [GoodInput]
    active: Boolean!
  }
  input GoodInput {
    id: ID
    name: String!
    price: Int!
    discount: Int
    img: String!
    filling: String!
    active: Boolean!
  }
  input GoodsInput {
    title: String
    items: [GoodInput]
  }
  input ImageInput {
    url: String
  }
  input AddProductInput {
    categoryId: ID!
    product: GoodInput!
  }
  input CategoryInput {
    id: ID
    title: String!
    img: String!
    active: Boolean!
    goods: [GoodInput]
    subCat: [SubcategoriesInput]
  }
  input SubcategoriesInput {
    id: ID
    title: String!
    img: String!
    categories: [CategoryInput]
  }
  input AddCategoryToSubcategoryInput {
    subcategoryId: ID!
    category: CategoryInput!
  }

  type Query {
    getAllGoods: [Good]
    getUser(id: ID): User
    getOrder(id: ID): Order
    getMenu: Menu
    getSubcategories: [Subcategories]
    login(login: String!, password: String!): AuthPayload
    getCategory(id: ID): Category
  }
  type Mutation {
    addProductToCategory(input: AddProductInput!): Good
    categoryUpsert(input: CategoryInput): Category
    userUpsert(input: UserInput!): User
    goodUpsert(input: GoodInput): [Good]
    subcategoryUpsert(input: SubcategoriesInput): Subcategories
    addCategoryToCategory(input: AddCategoryToSubcategoryInput!): Category
  }
`);
module.exports = schema