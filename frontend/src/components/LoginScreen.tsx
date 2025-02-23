import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginScreen.module.css";
import logo from "../icons/ICONE_the_news_com_AMARELO.avif";

const emailRegex =
  /^([a-z]){1,}([a-z0-9._-]){1,}([@]){1}([a-z]){2,}([.]){1}([a-z]){2,}([.]?){1}([a-z]?){2,}$/i;

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!emailRegex.test(email)) {
      setError("E-mail inválido! Tente novamente.");
      return;
    }

    setError("");
    localStorage.setItem("userEmail", email);
    navigate("/dashboard");
  };
  return (
    <div className={styles.container}>
      <img src={logo} className={styles.img} />
      <h1 className={styles.title}>the news</h1>
      <input
        type="email"
        placeholder="coloque seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      {error && <p className={styles.error}>{error}</p>}
      <button onClick={handleLogin}>Entrar</button>
    </div>
  );
};

export default LoginScreen;
