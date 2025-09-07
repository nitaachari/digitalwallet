import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API = import.meta.env.VITE_API_URL;

function CheckoutForm({ amt }) {
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) {
      alert("Stripe not ready yet");
      return;
    }

    const email = localStorage.getItem("useremail");

    // 1) Create PaymentIntent
    const res = await fetch(`${API}/wallet/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountPaise: Number(amt) * 100 }),
    });
    const { clientSecret } = await res.json();

    // 2) Confirm payment with card input
    const cardElement = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      alert("❌ Payment failed: " + error.message);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      // 3) Update balance in DB
      const res2 = await fetch(`${API}/wallet/addbalance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amountPaise: Number(amt) * 100 }),
      });

      const data = await res2.json();
      if (res2.ok && data.success) {
        alert(`✅ Balance updated! New balance: ₹${data.balance / 100}`);
      } else {
        alert("Failed to update balance: " + (data.error || "Unknown error"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "1rem auto" }}>
      <CardElement />
      <button disabled={!stripe} style={btn}>Pay</button>
    </form>
  );
}

export default function AddMoney() {
  const [amt, setAmt] = useState("");

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Add Money</h3>
      <input
        type="number"
        value={amt}
        onChange={(e) => setAmt(e.target.value)}
        placeholder="Amount ₹"
      />
      {amt > 0 && (
        <Elements stripe={stripePromise}>
          <CheckoutForm amt={amt} />
        </Elements>
      )}
    </div>
  );
}

const btn = { padding: "0.5rem 1rem", margin: "0.5rem", cursor: "pointer" };
