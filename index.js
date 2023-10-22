const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const schema = require('./schema');
const jwt = require('jsonwebtoken');
const fs = require('fs');


const secretKey = 'your-secret-key';
const client = loadDataFromFile('clients.json') || [];
const order = loadDataFromFile('orders.json') || [];
const menu = loadDataFromFile('menu.json') || [];
const sabCat = loadDataFromFile('menu.json') || [];
const allGoods = loadDataFromFile('all-goods.json') || [];

function loadDataFromFile(filename) {
   try {
      const data = fs.readFileSync(filename, 'utf8');
      return JSON.parse(data);
   } catch (err) {
      return null;
   }
}

function saveDataToFile(filename, data) {
   fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
}

const isLoginDuplicate = (login) => {
   return client.some((user) => user.login === login);
};

const userUpsert = (input) => {
   const { login } = input;

   if (isLoginDuplicate(login)) {
      throw new Error('Login already exists');
   }
   const id = Date.now();
   const user = { id, ...input };
   client.push(user);
   saveDataToFile('clients.json', client);
   return user;
};

const goodUpsert = (input) => {
   const id = Date.now();
   const good = { id, ...input };
   goods.push(good);
   saveDataToFile('goods.json', goods);
   allGoodsUpsert(good);
   return good;
};

const categoryUpsert = (input) => {
   const id = Date.now();
   const category = { id, ...input };
   menu.push(category);
   saveDataToFile('menu.json', menu);
   return category;
};
const subcategoryUpsert = (input) => {
   const id = Date.now();
   const subcategory = { id, ...input };
   sabCat.push(subcategory);
   saveDataToFile('menu.json', sabCat);
   return subcategory;
};

const allGoodsUpsert = (input) => {
   const id = Date.now();
   const allGood = { id, ...input };
   allGoods.push(allGood);
   saveDataToFile('all-goods.json', allGoods);
   return allGood;
};

const addProductToCategory = ({ categoryId, product }) => {
   const category = findCategoryById(categoryId, menu);
   if (!category) {
      throw new Error('Category not found');
   }
   if (!category.goods) {
      category.goods = [];
   }
   const newProduct = {
      id: Date.now(),
      ...product,
   };
   category.goods.push(newProduct);
   allGoodsUpsert(newProduct);
   saveDataToFile('menu.json', menu);
   return category;
};



const log = ({ login, password }) => {
   const user = client.find((u) => u.login === login);
   if (!user || user.password !== password) {
      throw new Error('Invalid login or password');
   }
   const token = jwt.sign({ userId: user.id }, secretKey, {
      expiresIn: '1h',
   });
   return { token };
};
const addCategoryToCategory = ({ input }) => {
   const { subcategoryId, category } = input;
   const menuCategory = menu.find((cat) => cat.id == subcategoryId);
   if (!menuCategory) {
      throw new Error('Category not found');
   }
   if (!menuCategory.subCat) {
      menuCategory.subCat = [];
   }
   const newSubcategoryId = Date.now();
   const newSubcategory = { id: newSubcategoryId, ...category };
   menuCategory.subCat.push(newSubcategory);
   saveDataToFile('menu.json', menu);
   return newSubcategory;
};
const findCategoryById = (categories, id) => {
   for (const category of categories) {
      if (category.id === id) {
         return category;
      }
      if (category.subCat) {
         const subCategory = findCategoryById(category.subCat, id);
         if (subCategory) {
            return subCategory;
         }
      }
   }
   return null;
};



const root = {
   getUser: ({ id }) => {
      return client.find((user) => user.id == id);
   },
   getAllGoods: () => {
      return allGoods;
   },
   getOrder: ({ id }) => {
      return order.find((ord) => ord.id == id);
   },
   userUpsert: ({ input }) => {
      const user = userUpsert(input);
      return user;
   },
   goodUpsert: ({ input }) => {
      const good = goodUpsert(input);
      return good;
   },
   categoryUpsert: ({ input }) => {
      const category = categoryUpsert(input);
      return category;
   },
   subcategoryUpsert: ({ input }) => {
      const subcategory = subcategoryUpsert(input);
      return subcategory;
   },
   getSubcategories: () => {
      return sabCat;
   },
   addProductToCategory: ({ input }) => {
      const category = addProductToCategory(input);
      return category;
   },
   getMenu: () => {
      return { categories: menu };
   },
   getCategory: ({ id }) => {
      const category = findCategoryById(menu, id);
      if (!category) {
         throw new Error('Category not found');
      }
      return category;
   },
   addCategoryToCategory,
   login: ({ login, password }) => {
      const authPayload = log({ login, password });
      return authPayload;
   },
};


const app = express();
app.use(cors());

app.use('/graphql', graphqlHTTP({
   schema,
   rootValue: root,
   graphiql: true,
}));

app.listen(5000, () => console.log('Server started on port 5000'));

process.on('SIGINT', () => {
   saveDataToFile('clients.json', client);
   saveDataToFile('goods.json', goods);
   saveDataToFile('menu.json', menu);
   process.exit();
});