const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String, 
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      { 
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
      }
    ],
    cartTotal: { type: Number, required: true }
  }
});

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  let newCartTotal = 0;
  const updatedCartItems = [...this.cart.items];

  if(cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  };
  
  const updatedCart = { 
    items: updatedCartItems,
    cartTotal: newCartTotal
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.cartTotal = function() {
  const cartItems = this.cart.items;
  let newCartTotal = 0;
  cartItems.forEach(p => {
    newCartTotal += p.quantity;
  });

  this.cart.cartTotal = newCartTotal;
  return this.save();
};

userSchema.methods.removeFromCart = function(productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return item.productId.toString() !== productId.toString();
  });

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.removeCartTotal = function() {
  let cartTotal = this.cart.cartTotal;
  let newCartTotal = 0;
  this.cart.items.filter(item => {
    
  });

  this.cart.cartTotal = newCartTotal;
  if(!newCartTotal) {
    this.cart.cartTotal = 0;
  }
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart = {items: [], cartTotal: 0};
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

/* const mongodb = require('mongodb');
const mongoConnect = require('../util/database');

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  async save(callback = () => {}) {
    try {
      await mongoConnect((_db, client) => {
        // Use the collection "people"
        let p;
        const col = _db.collection("users");

        p = col.insertOne(this);
      });
    } finally {
      mongoConnect((_db, client) => {
        () => client.close();
      });
      callback();
    }
  }

  async getCart() {
    let p;

    const productIds = this.cart.items.map(i => {
      return i.productId;
    });

    await mongoConnect((_db, client) => {
      const col = _db.collection("products");

      p = col.find({_id: {$in: productIds}})
      .toArray()
      .then(products => {
        return products.map(p => {
            return {...p, quantity: this.cart.items.find(i => {
               return i.productId.toString() === p._id.toString();
            }).quantity
           };
          });
        });
    });

    return p;
  }

  async deleteFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });

    let p;

    await mongoConnect((_db, client) => {
      const col = _db.collection("users");

      p = col.updateOne(
        {_id: new mongodb.ObjectId(this._id)},
        {$set: {cart: {items: updatedCartItems}}}
      )
      .then(result => {
        return result;
      });
    });

    return p;
  }

  async addOrder() {
    let p;

    await mongoConnect((_db, client) => {
      const col = _db.collection("orders");

      return this.getCart().
      then(products => {
        const order = {
          items: products,
          user: {
            _id: new mongodb.ObjectId(this._id),
            name: this.name,
            email: this.email
          }
        };
        // Add the cart to order and then clear the cart
        p = col.insertOne(order);
      })
      .then(result => {
        this.cart = {items: []};
        return _db.collection("users").updateOne(
          {_id: new mongodb.ObjectId(this._id)},
          {$set: {cart: {items: []}}}
        );
      });
    });

    return p;
  }

  async getOrders() {
    let p;

    await mongoConnect((_db, client) => {
      const col = _db.collection("orders");

      p = col.find({"user._id": new mongodb.ObjectId(this._id)}).toArray();
    });

    return p;
  }

  static findById(userId) {
    async function result() {
      let p;

      await mongoConnect((_db, client) => {
        const col = _db.collection("users");
        p = col.findOne({_id: new mongodb.ObjectId(userId)})
        .then(user => {
          return user;
        })
        .catch(err => {console.log(err)});
      });
      
      return p;
    }
    
    return result();
  }
};

module.exports = User;
*/