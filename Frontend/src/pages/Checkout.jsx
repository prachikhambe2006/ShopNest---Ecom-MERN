import React, { useState, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const cartItems = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [processing, setProcessing] = useState(false);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handlePayment = async () => {
    try {
      setProcessing(true);

      const orderRes = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: totalPrice
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        const fallback = window.confirm(
          'Razorpay keys unconfigured on backend. Use Student Bypass Mode to place test order?'
        );

        if (fallback) {
          return bypassPayment();
        } else {
          setProcessing(false);
          toast.error('Payment failed to initialize');
          return;
        }
      }

      const options = {
        key: 'rzp_test_dummykey123',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShopNest',
        description: 'Order Payment',
        order_id: orderData.id,

        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(response)
            });

            if (verifyRes.ok) {
              const saveOrderRes = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                  items: cartItems,
                  totalAmount: totalPrice,
                  address,
                  paymentId: response.razorpay_payment_id
                })
              });

              if (saveOrderRes.ok) {
                setProcessing(false);

                dispatch(clearCart());

                toast.success('Order placed successfully!');

                setTimeout(() => {
                  navigate('/ordersuccess');
                }, 1500);
              } else {
                setProcessing(false);
                toast.error('Order saving failed');
              }
            } else {
              setProcessing(false);
              toast.error('Payment verification failed');
            }
          } catch (error) {
            setProcessing(false);
            console.error(error);
            toast.error('Something went wrong');
          }
        },

        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: '9999999999'
        },

        theme: {
          color: '#f97316'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      setProcessing(false);
      console.error(error);
      toast.error('Payment process failed');
    }
  };

  const bypassPayment = async () => {
    try {
      const saveOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount: totalPrice,
          address,
          paymentId: 'bypass_txn_' + Date.now()
        })
      });

      if (saveOrderRes.ok) {
        setProcessing(false);

        dispatch(clearCart());

        toast.success('Payment Successful!');

        setTimeout(() => {
          navigate('/ordersuccess');
        }, 1500);
      } else {
        setProcessing(false);
        toast.error('Order saving failed');
      }
    } catch (error) {
      setProcessing(false);
      toast.error('Something went wrong');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.warning('Your cart is empty');
      return;
    }

    handlePayment();
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="checkout-content">
        <form onSubmit={handleSubmit} className="shipping-form">
          <h3>Shipping Address</h3>

          <input
            type="text"
            placeholder="Full Name"
            required
            value={address.fullName}
            onChange={(e) =>
              setAddress({ ...address, fullName: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Street"
            required
            value={address.street}
            onChange={(e) =>
              setAddress({ ...address, street: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="City"
            required
            value={address.city}
            onChange={(e) =>
              setAddress({ ...address, city: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Postal Code"
            required
            value={address.postalCode}
            onChange={(e) =>
              setAddress({ ...address, postalCode: e.target.value })
            }
          />

          <input
            type="text"
            placeholder="Country"
            required
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
          />

          <div className="checkout-summary">

           {processing && (
          <div className="processing-message">
          <div className="loader"></div>
           <p>Payment Processing...</p>
               <small>Please wait while we verify your payment.</small>
           </div>
             )}

            <h4>Total to Pay: ₹{totalPrice.toFixed(2)}</h4>

            <button
              type="submit"
              className="btn"
              disabled={processing}
            >
              {processing ? 'Processing Payment...' : 'Pay Now'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;