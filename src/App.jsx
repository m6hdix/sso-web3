import { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("token");

    if (token) {
      const checkAuthentication = async () => {
        try {
          const response = await axios.post(
            "http://localhost:3001/verify-token",
            { token }
          );
          setAuthenticated(true);
          setAddress(response.data.address);
        } catch (error) {
          console.error("Authentication failed", error);
        }
      };

      checkAuthentication();
    }
  }, []);

  const handleOpenWallet = async () => {
    if (window.ethereum) {
      try {
        console.log("Checking if already connected...");
        let accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length === 0) {
          console.log("Not connected. Requesting connection...");
          accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
        } else {
          console.log("Already connected.");
        }

        if (accounts.length > 0) {
          const currentAddress = accounts[0];
          console.log("Current address:", currentAddress);

          // Check if the current address matches the authenticated address
          if (currentAddress.toLowerCase() === address.toLowerCase()) {
            console.log("Address match confirmed");
            alert(`کیف پول با موفقیت باز شد.\nآدرس: ${currentAddress}`);
          } else {
            console.log("Address mismatch");
            alert(
              "آدرس کیف پول با آدرس احراز هویت شده مطابقت ندارد. لطفاً از حساب صحیح استفاده کنید."
            );
          }
        } else {
          console.log("No accounts found");
          alert(
            "حسابی پیدا نشد. لطفاً مطمئن شوید که در MetaMask وارد شده‌اید و اجازه دسترسی داده‌اید."
          );
        }
      } catch (error) {
        console.error("Error interacting with wallet:", error);
        alert(`خطا در تعامل با کیف پول: ${error.message}`);
      }
    } else {
      console.log("MetaMask not installed");
      alert(
        "MetaMask نصب نشده است. لطفاً MetaMask را نصب کرده و دوباره امتحان کنید."
      );
    }
  };

  return (
    <div>
      <h1>Domain 2</h1>
      {authenticated ? (
        <div>
          <p>Welcome, {address}</p>
          <button onClick={handleOpenWallet}>Open Wallet</button>
        </div>
      ) : (
        <p>Please login through Domain 1</p>
      )}
    </div>
  );
};

export default App;
