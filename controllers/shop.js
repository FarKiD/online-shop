const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 3;

exports.getIndex = (req, res, next) => {
  //pagination
  const page = +req.query.page || 1;
  let totalItems;

  let cartTotal;
  if(req.user) {
    cartTotal = req.user.cart.cartTotal;
  } else {
    cartTotal = 0;
  }
  
  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  })
  .then(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      pageBeforeLast: Math.ceil(totalItems / ITEMS_PER_PAGE) - 2,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      cartTotal
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
  //pagination
  const page = +req.query.page || 1;
  let totalItems;

  let cartTotal;
  if(req.user) {
    cartTotal = req.user.cart.cartTotal;
  } else {
    cartTotal = 0;
  }

  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE);
  }).then(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      cartTotal
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProduct = (req, res, next) => {
  let cartTotal;
  if(req.user) {
    cartTotal = req.user.cart.cartTotal;
  } else {
    cartTotal = 0;
  }

  const prodId = req.params.productId;
  Product.findById(prodId)
  .then(product => {
    res.render('shop/product-detail', {
      product,
      pageTitle: `Buy ${product.title}`,
      path: '/products',
      cartTotal: cartTotal
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCart = (req, res, next) => {
  let cartTotal;
  if(req.user) {
    cartTotal = req.user.cart.cartTotal;
  } else {
    cartTotal = 0;
  }

  req.user.populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items;
    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products,
      cartTotal
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getCheckout = (req, res, next) => {
  let cartTotal;
  if(req.user) {
    cartTotal = req.user.cart.cartTotal;
  } else {
    cartTotal = 0;
  }

  req.user.populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items;
    let total = 0;
    products.forEach(p => {
      total += p.quantity * p.productId.price;
    });
    res.render('shop/checkout', {
      pageTitle: 'Checkout',
      path: '/checkout',
      totalSum: total,
      products,
      cartTotal
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);
  })
  .then(result => {
    return req.user.cartTotal();
  })
  .then(result => {
    res.redirect('/cart');
  });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result => {
    return req.user.cartTotal();
  })
  .then(result => {
    res.redirect('/cart');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId')
  .then(user => {
    const products = user.cart.items.map(i => {
      return {quantity: i.quantity, product: { ...i.productId._doc }}
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products
    });
    return order.save();
  }).then(result => {
    return req.user.clearCart();
  })
  .then(() => {
    res.redirect('/orders');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getOrders = (req, res, next) => {
  let cartTotal;
  if(req.user) {
    cartTotal = req.user.cart.cartTotal;
  } else {
    cartTotal = 0;
  }

  Order.find({"user.userId": req.user._id})
  .then(orders => {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders,
      cartTotal
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
  .then(order => {
    if (!order) {
      return next(new Error('No order found.'));
    }

    if(order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized!'));
    }
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="' + invoiceName + '"'
    );

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {
      underline: true
    });

    pdfDoc.text('-----------------------');

    let totalPrice = 0;

    order.products.forEach(prod => {
      totalPrice += + prod.quantity * prod.product.price;
      pdfDoc.fontSize(14).text(
        prod.product.title +
        ' -- ' + prod.quantity +
        ' x ' +
        '$' +
        prod.product.price);
    });

    pdfDoc.text('-----------------------');
    pdfDoc.fontSize(18).text('Total Price: $' +totalPrice);

    pdfDoc.end();
  })
  .catch(err => next(err));
};