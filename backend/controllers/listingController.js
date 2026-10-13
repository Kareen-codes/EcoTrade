const Listing = require('../models/listingModel');
const Order = require('../models/orderModel');
const Favorite = require('../models/favoriteModel');
const { createNotification } = require('../services/notificationService');
const { generateOrderNumber, recordImpact } = require('../services/marketplaceService');

/**
 * Listings — marketplace (materials) + art gallery (artwork).
 * Logic adapted from MarketX-backend `products/` module:
 * filters + pagination, inventory (available), views counter,
 * buy-now creating an Order, and auction bidding.
 */

// GET /api/listings?type=material|artwork&category=plastic&saleType=fixed&q=text&page=1&limit=12&sort=newest|price_asc|price_desc
const getListings = async (req, res) => {
  try {
    const { type, category, saleType, status, q, sort, seller, mine } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);

    const filter = {};
    if (type) filter.type = type;
    if (category && category !== 'all') filter.category = category;
    if (saleType) filter.saleType = saleType;
    // Only active public listings unless explicitly filtering
    filter.status = status || 'active';
    if (mine === 'true' && req.user) filter.seller = req.user.id;
    else if (seller) filter.seller = seller;
    if (q) filter.$text = { $search: q };

    let sortSpec = { createdAt: -1 };
    if (sort === 'price_asc') sortSpec = { price: 1 };
    else if (sort === 'price_desc') sortSpec = { price: -1 };
    else if (sort === 'ending_soon' && saleType === 'auction') sortSpec = { auctionEndsAt: 1 };

    const [items, total] = await Promise.all([
      Listing.find(filter)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('seller', 'name profileImage state'),
      Listing.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings.', error: error.message });
  }
};

// GET /api/listings/:id — single listing + view counter
const getListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('seller', 'name profileImage state bio')
      .populate('currentBidder', 'name profileImage');

    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listing.', error: error.message });
  }
};

// POST /api/listings — create (auth)
const createListing = async (req, res) => {
  try {
    const { title, description, category, type, saleType, price, quantity, weightKg, condition, location, tags, auctionDurationHours, images } = req.body;

    if (!title || !description || !category || price === undefined) {
      return res.status(400).json({ message: 'title, description, category and price are required.' });
    }

    const data = {
      title,
      description,
      category,
      type: type === 'artwork' ? 'artwork' : 'material',
      saleType: saleType === 'auction' ? 'auction' : 'fixed',
      price: Number(price),
      quantity: Number(quantity) || 1,
      available: Number(quantity) || 1,
      weightKg: Number(weightKg) || 0,
      condition: condition || 'good',
      location: location || '',
      tags: Array.isArray(tags) ? tags : [],
      images: Array.isArray(images) ? images : [],
      seller: req.user.id,
    };

    if (data.saleType === 'auction') {
      const hours = Number(auctionDurationHours) || 72;
      data.auctionEndsAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    const listing = await Listing.create(data);
    res.status(201).json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error creating listing.', error: error.message });
  }
};

// PUT /api/listings/:id — seller edits own listing
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own listings.' });
    }

    const allowed = ['title', 'description', 'category', 'price', 'quantity', 'weightKg', 'condition', 'location', 'tags', 'images', 'status'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) listing[field] = req.body[field];
    });

    await listing.save();
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing.', error: error.message });
  }
};

// DELETE /api/listings/:id
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    listing.status = 'cancelled';
    await listing.save();
    res.json({ message: 'Listing removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting listing.', error: error.message });
  }
};

// POST /api/listings/:id/buy — buy-now → creates an order (escrow unpaid)
const buyNow = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.status !== 'active' || listing.available < 1) {
      return res.status(400).json({ message: 'This listing is not available.' });
    }
    if (listing.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot buy your own listing.' });
    }

    const quantity = Math.min(Math.max(parseInt(req.body.quantity) || 1, 1), listing.available);
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      buyer: req.user.id,
      seller: listing.seller,
      listing: listing._id,
      itemSnapshot: {
        title: listing.title,
        category: listing.category,
        type: listing.type,
        image: listing.images[0] || '',
        weightKg: listing.weightKg,
      },
      quantity,
      unitPrice: listing.price,
      totalAmount: listing.price * quantity,
      shippingAddress: req.body.shippingAddress || '',
      phone: req.body.phone || '',
      notes: req.body.notes || '',
      timeline: [{ status: 'pending', note: 'Order created', by: req.user.id }],
    });

    // Reserve inventory
    listing.available -= quantity;
    if (listing.available <= 0) listing.status = 'sold';
    await listing.save();

    await createNotification(listing.seller, 'order', 'New order', `A buyer placed an order for "${listing.title}".`, { orderId: order._id, listingId: listing._id });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order.', error: error.message });
  }
};

// POST /api/listings/:id/bid — auction bid (MarketX bidding rules)
const placeBid = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.saleType !== 'auction') {
      return res.status(400).json({ message: 'This listing is not an auction.' });
    }
    if (listing.status !== 'active') return res.status(400).json({ message: 'Auction is closed.' });
    if (listing.auctionEndsAt && listing.auctionEndsAt < new Date()) {
      return res.status(400).json({ message: 'This auction has ended.' });
    }
    if (listing.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot bid on your own auction.' });
    }

    const amount = Number(req.body.amount);
    const minBid = listing.currentBid > 0 ? listing.currentBid * 1.05 : listing.price;
    if (!amount || amount < minBid) {
      return res.status(400).json({ message: `Bid must be at least ₦${Math.ceil(minBid).toLocaleString()}.` });
    }

    listing.currentBid = amount;
    listing.currentBidder = req.user.id;
    listing.bids.push({ bidder: req.user.id, amount });
    await listing.save();

    await createNotification(listing.seller, 'bid', 'New bid', `Someone bid ₦${amount.toLocaleString()} on "${listing.title}".`, { listingId: listing._id, amount });

    res.status(201).json({ message: 'Bid placed.', currentBid: amount });
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid.', error: error.message });
  }
};

// POST /api/listings/:id/close-auction — settle (seller/admin, or after end time)
const closeAuction = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });
    if (listing.saleType !== 'auction') return res.status(400).json({ message: 'Not an auction.' });
    if (listing.status !== 'active') return res.status(400).json({ message: 'Auction already settled.' });

    const ended = listing.auctionEndsAt && listing.auctionEndsAt <= new Date();
    const isOwner = listing.seller.toString() === req.user.id;
    if (!ended && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Auction has not ended yet.' });
    }

    listing.status = 'closed';
    if (listing.currentBidder) {
      listing.winner = listing.currentBidder;
      // Create the winning order (unpaid; buyer completes payment via orders API)
      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        buyer: listing.currentBidder,
        seller: listing.seller,
        listing: listing._id,
        itemSnapshot: {
          title: listing.title,
          category: listing.category,
          type: listing.type,
          image: listing.images[0] || '',
          weightKg: listing.weightKg,
        },
        quantity: 1,
        unitPrice: listing.currentBid,
        totalAmount: listing.currentBid,
        timeline: [{ status: 'pending', note: 'Auction won — awaiting payment', by: listing.seller }],
      });
      await createNotification(listing.currentBidder, 'order', 'You won! 🎉', `You won the auction for "${listing.title}". Complete your payment.`, { orderId: order._id, listingId: listing._id });
    }
    await listing.save();

    res.json({ message: 'Auction settled.', winner: listing.winner || null });
  } catch (error) {
    res.status(500).json({ message: 'Error closing auction.', error: error.message });
  }
};

// POST /api/listings/:id/favorite — toggle favorite (no self-favorite restriction; MarketX favorites)
const toggleFavorite = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    const existing = await Favorite.findOneAndDelete({ user: req.user.id, listing: listing._id });
    if (existing) {
      listing.favoritesCount = Math.max(listing.favoritesCount - 1, 0);
      await listing.save();
      return res.json({ favorited: false, favoritesCount: listing.favoritesCount });
    }

    await Favorite.create({ user: req.user.id, listing: listing._id });
    listing.favoritesCount += 1;
    await listing.save();
    res.json({ favorited: true, favoritesCount: listing.favoritesCount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating favorite.', error: error.message });
  }
};

// GET /api/listings/me/favorites
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({ path: 'listing', populate: { path: 'seller', select: 'name profileImage' } });
    res.json(favorites.map((f) => f.listing).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites.', error: error.message });
  }
};

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  buyNow,
  placeBid,
  closeAuction,
  toggleFavorite,
  getMyFavorites,
};
