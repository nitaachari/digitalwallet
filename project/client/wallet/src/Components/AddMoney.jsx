import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// ✅ Load Stripe and API from env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API = import.meta.env.VITE_API_URL;

function CheckoutForm({ amt }) {
  const stripe = useStripe();
  const elements = useElements();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!stripe || !elements) {
      alert("Stripe not loaded yet");
      return;
    }

    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      alert(error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // ✅ Call backend to update balance in DB
      const email = localStorage.getItem("useremail");

      const res = await fetch(`${API}/wallet/addbalance`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, amountPaise: Number(amt) * 100 }),
});
      



      const data = await res.json();
      if (res.ok && data.ok) {
        alert(`Balance updated! New balance: ₹${data.newBalance / 100}`);
      } else {
        alert("Failed to update balance: " + (data.error || "Unknown error"));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "1rem auto" }}>
      <PaymentElement />
      <button disabled={!stripe} style={btn}>Pay</button>
    </form>
  );
}

export default function AddMoney() {
  const [amt, setAmt] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  async function createIntent() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to add money.");
      return;
    }
    if (!amt || Number(amt) <= 0) {
      alert("Enter a valid amount");
      return;
    }

    // ✅ Ask backend for PaymentIntent
    const res = await fetch(`${API}/wallet/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amountPaise: Number(amt) * 100 }),
    });

    const data = await res.json();
    if (res.ok && data.clientSecret) {
      setClientSecret(data.clientSecret);
    } else {
      alert(data.error || "Failed to create payment intent");
    }
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Add Money</h3>
      {!clientSecret ? (
        <div>
          <input
            type="number"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
            placeholder="Amount ₹"
          />
          <button onClick={createIntent} style={btn}>Proceed</button>
        </div>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm amt={amt} />
        </Elements>
      )}
    </div>
  );
}

const btn = { padding: "0.5rem 1rem", margin: "0.5rem", cursor: "pointer" };
