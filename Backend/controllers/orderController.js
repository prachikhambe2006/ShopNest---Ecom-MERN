const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

const addOrderItems = async (req, res) => {
  try {
    const { items, totalAmount, address, paymentId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      address,
      paymentId,
    });

    const createdOrder = await order.save();

    // Send response immediately (Don't wait for email)
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });

    // Send email in background
    const message = `
      <h2>Order Confirmation</h2>
      <p>Hello <b>${req.user.name}</b>,</p>

      <p>Your order has been placed successfully.</p>

      <p><b>Order ID:</b> ${createdOrder._id}</p>

      <p><b>Total Amount:</b> ₹${totalAmount}</p>

      <p><b>Shipping Address:</b></p>

      <p>
      ${address.fullName}<br>
      ${address.street}<br>
      ${address.city} - ${address.postalCode}<br>
      ${address.country}
      </p>

      <p>Thank you for shopping with <b>ShopNest ❤️</b></p>
    `;

    sendEmail({
      email: req.user.email,
      subject: "ShopNest - Order Confirmation",
      message,
    }).catch((err) => console.log("Email Error:", err.message));

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('userId', 'id name');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addOrderItems, getMyOrders, getOrders, updateOrderStatus };