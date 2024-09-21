import React, { useState } from "react";
import awsConfig from "../aws-config";
import axios from "axios";
import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

export const Authentication = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [cipherKey, setCipherKey] = useState("");
  const [group, setGroup] = useState("RegisteredCustomers");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [userType, setUserType] = useState("RegisteredCustomer");
  const [authState, setAuthState] = useState("signUp");
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");

  const handleChange = (setter) => (e) => setter(e.target.value);

  const handleGroupChange = (e) => {
    const selectedGroup = e.target.value;
    setGroup(selectedGroup);
    setUserType(
      selectedGroup === "RegisteredCustomers"
        ? "RegisteredCustomer"
        : "PropertyAgent"
    );
  };

  const handleRequest = async (url, target, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-amz-json-1.1",
        "X-Amz-Target": target,
      },
      body: JSON.stringify(body),
    });
    return await response.json();
  };

  const signUp = async () => {
    const params = {
      ClientId: awsConfig.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "custom:user_name", Value: name },
        { Name: "custom:security_question", Value: question },
        { Name: "custom:security_answer", Value: answer },
        { Name: "custom:cipher_key", Value: cipherKey },
        { Name: "custom:user_group", Value: group },
        { Name: "custom:user_address", Value: address },
        { Name: "custom:city", Value: city },
        { Name: "custom:pincode", Value: pincode },
        { Name: "custom:contact_no", Value: contactNo },
        { Name: "custom:user_type", Value: userType },
      ],
    };
    const data = await handleRequest(
      `https://cognito-idp.${awsConfig.region}.amazonaws.com/`,
      "AWSCognitoIdentityProviderService.SignUp",
      params
    );
    if (data.UserSub) setAuthState("verify");
    else alert(data.message || "Error signing up");
  };

  const confirmSignUp = async () => {
    const code = prompt("Enter the verification code you received via email:");
    const params = {
      ClientId: awsConfig.clientId,
      Username: email,
      ConfirmationCode: code,
    };
    const data = await handleRequest(
      `https://cognito-idp.${awsConfig.region}.amazonaws.com/`,
      "AWSCognitoIdentityProviderService.ConfirmSignUp",
      params
    );
    if (!data.message) {
      setAuthState("signIn");
      const response = await axios.post(
        "https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/notify-user",
        {
          email: email,
        }
      );
      if (response.status === 200) {
        console.log("Successful registration notification sent to the user.");
      } else {
        console.log(
          "Successful registration notification could not be sent to the user."
        );
      }
    }
  };

  const signIn = async () => {
    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: awsConfig.clientId,
      AuthParameters: { USERNAME: email, PASSWORD: password },
    };
    const data = await handleRequest(
      `https://cognito-idp.${awsConfig.region}.amazonaws.com/`,
      "AWSCognitoIdentityProviderService.InitiateAuth",
      params
    );

    console.log("Authentication response:", data);

    if (data.AuthenticationResult) {
      const { IdToken, AccessToken, RefreshToken } = data.AuthenticationResult;

      console.log("ID Token:", IdToken);
      console.log("Access Token:", AccessToken);
      console.log("Refresh Token:", RefreshToken);

      const decodedToken = parseJwt(IdToken);

      console.log(decodedToken);

      const userId = decodedToken["email"];
      const userType = decodedToken["custom:user_type"];

      console.log("User ID:", userId);
      console.log("User Type:", userType);

      setUserId(userId);
      setUserRole(userType);
      setUser(data.AuthenticationResult);
      setAuthState("verify2FA");

      localStorage.setItem("accessToken", AccessToken);
      localStorage.setItem("userDetails", JSON.stringify({ userId, userType }));
    } else {
      alert(data.message || "Error signing in");
    }
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      console.error("Error parsing JWT token", e);
      return null;
    }
  };

  const verify2FA = async () => {
    const answerInput = prompt("Enter the answer to your security question:");
    const params = { email, answer: answerInput };
    const response = await fetch(
      "https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/verifyAnswer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.AccessToken}`,
        },
        body: JSON.stringify(params),
      }
    );
    const data = await response.json();
    if (data.result) {
      setAuthState("verify3FA");
    } else {
      alert("2FA failed");
    }
  };

  const generateRandomString = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const verify3FA = async () => {
    const randomString = generateRandomString(3);
    const attemptedDecoding = prompt(
      `Decode the following string using your cipher key: ${randomString}`
    );
    const params = { email, encodedString: randomString, attemptedDecoding };
    const response = await fetch(
      "https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/verifyCipher",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.AccessToken}`,
        },
        body: JSON.stringify(params),
      }
    );
    const data = await response.json();
    if (data.body.isDecodingCorrect) {
      navigate("/", { state: { accessToken: user.AccessToken } });
      const response = await axios.post(
        "https://2os6c3lw93.execute-api.us-east-1.amazonaws.com/dev/notify-login",
        {
          email: email,
        }
      );
      if (response.status === 200) {
        console.log("Successful login notification sent to the user.");
      } else {
        console.log(
          "Successful login notification could not be sent to the user."
        );
      }
    } else {
      alert("3FA failed");
    }
  };

  const signOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userDetails");
    setAuthState("signIn");
  };

  const continueAsGuest = () => {
    navigate("/", { state: { accessToken: null } });
  };

  const renderAuthState = () => {
    switch (authState) {
      case "signUp":
        return (
          <div>
            <h2>Sign Up</h2>
            <input
              type="email"
              value={email}
              onChange={handleChange(setEmail)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={handleChange(setPassword)}
              placeholder="Password"
            />
            <input
              type="text"
              value={name}
              onChange={handleChange(setName)}
              placeholder="Name"
            />
            <select value={question} onChange={handleChange(setQuestion)}>
              <option value="">Select a security question</option>
              <option value="q1">What is your mother's maiden name?</option>
              <option value="q2">What was the name of your first pet?</option>
              <option value="q3">What was the make of your first car?</option>
              <option value="q4">What is your favorite book?</option>
              <option value="q5">What city were you born in?</option>
            </select>
            <input
              type="text"
              value={answer}
              onChange={handleChange(setAnswer)}
              placeholder="Answer"
            />
            <input
              type="number"
              value={cipherKey}
              onChange={handleChange(setCipherKey)}
              placeholder="Cipher Key"
            />
            <select value={group} onChange={handleGroupChange}>
              <option value="RegisteredCustomers">Registered Customers</option>
              <option value="PropertyAgents">Property Agents</option>
            </select>
            <input
              type="text"
              value={address}
              onChange={handleChange(setAddress)}
              placeholder="Address"
            />
            <input
              type="text"
              value={city}
              onChange={handleChange(setCity)}
              placeholder="City"
            />
            <input
              type="text"
              value={pincode}
              onChange={handleChange(setPincode)}
              placeholder="Pincode"
            />
            <input
              type="text"
              value={contactNo}
              onChange={handleChange(setContactNo)}
              placeholder="Contact No"
            />
            <button onClick={signUp}>Sign Up</button>
            <button onClick={() => setAuthState("signIn")}>
              Go to Sign In
            </button>
            <button onClick={continueAsGuest}>Continue as Guest</button>
          </div>
        );
      case "verify":
        return (
          <div>
            <h2>Verify Account</h2>
            <button onClick={confirmSignUp}>Enter Verification Code</button>
          </div>
        );
      case "signIn":
        return (
          <div>
            <h2>Sign In</h2>
            <input
              type="email"
              value={email}
              onChange={handleChange(setEmail)}
              placeholder="Email"
            />
            <input
              type="password"
              value={password}
              onChange={handleChange(setPassword)}
              placeholder="Password"
            />
            <button onClick={signIn}>Sign In</button>
            <button onClick={() => setAuthState("signUp")}>
              Go to Sign Up
            </button>
            <button onClick={continueAsGuest}>Continue as Guest</button>
          </div>
        );
      case "verify2FA":
        return (
          <div>
            <h2>Verify 2FA</h2>
            <button onClick={verify2FA}>Verify 2FA</button>
          </div>
        );
      case "verify3FA":
        return (
          <div>
            <h2>Verify 3FA</h2>
            <button onClick={verify3FA}>Verify 3FA</button>
          </div>
        );
      case "signedIn":
        return (
          <div>
            <h2>Welcome!</h2>
            <p>User ID: {userId}</p>
            <p>User Type: {userRole}</p>
            <button onClick={signOut}>Sign Out</button>
          </div>
        );
      case "guest":
        return (
          <div>
            <h2>Welcome, Guest!</h2>
            <p>You are browsing as a guest.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    >
      {renderAuthState()}
    </div>
  );
};

export default Authentication;
