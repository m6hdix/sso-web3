import { useState } from "react";
import Web3 from "web3";
import axios from "axios";

const App = () => {
  const [address, setAddress] = useState("");

  const handleLogin = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        setAddress(account);

        const message = `Login to domain1 with address hm-200008 metarange: ${account}`;
        const signature = await web3.eth.personal.sign(message, account, "");
        console.log(signature);
        const response = await axios.post(
          "http://localhost:3001/authenticate",
          {
            address: account,
            signature,
            message,
          }
        );

        const { token } = response.data;
        localStorage.setItem("token", token);
        window.location.href = `http://localhost:5175?token=${token}`;
      } catch (error) {
        console.error("Error during login", error);
        alert("Login failed. Please try again.");
      }
    } else {
      alert("MetaMask not installed");
    }
  };

  return (
    <div>
      <h1>Domain 1</h1>
      <button onClick={handleLogin}>Login with MetaMask</button>
      <p>Address: {address}</p>
    </div>
  );
};

export default App;
