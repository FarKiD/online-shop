const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);

/* const mongodb = require('mongodb');
const mongoConnect = require('../util/database');

class Product { 
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  }

  async save(callback = () => {}) {
    try {
      await mongoConnect((_db, client) => {
        // Use the collection "people"
        let p;
        const col = _db.collection("products");

        if (this._id) {
          p = col.updateOne({
            _id: this._id
          }, {
            $set: this
          });
        } else {
          // Insert a single document, wait for promise so we can read it back
          p = col.insertOne(this);
        }
      });
    } finally {
      mongoConnect((_db, client) => {
        () => client.close();
      });
      callback();
    }
  }

  static fetchAll() {
    async function result() {
      let p;

      await mongoConnect((_db, client) => {
        const col = _db.collection("products");
        p = col.find().toArray().then(products => {
          return products;
        }).catch(err => {console.log(err)});
      });
      
      return p;
    }
    
    return result();
  }

  static findById(prodId) {
    async function result() {
      let p;

      await mongoConnect((_db, client) => {
        const col = _db.collection("products");
        p = col.find({_id: new mongodb.ObjectId(prodId)})
        .next()
        .then(product => {
          return product;
        })
        .catch(err => {console.log(err)});
      });
      
      return p;
    }
    
    return result();
  }

  static deleteById(prodId) {
    async function result() {
      let p;

      await mongoConnect((_db, client) => {
        const col = _db.collection("products");
        p = col.deleteOne({_id: new mongodb.ObjectId(prodId)})
        .then(product => {
          return product;
        })
        .catch(err => {console.log(err)});
      });
      
      return p;
    }
    
    return result();
  }
};

module.exports = Product;
*/