import React from "react";
import { Link } from "react-router-dom";

const LoyeHome = () => {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Bienvenue sur Loye</h1>
      <p>Payez votre loyer, gérez vos propriétés et restez informé.</p>

      <div style={{ marginTop: "2rem" }}>
        <Link to="/loye/login">
          <button style={{ margin: "1rem", padding: "1rem 2rem" }}>Se connecter</button>
        </Link>
        <Link to="/loye/signup">
          <button style={{ margin: "1rem", padding: "1rem 2rem" }}>Créer un compte</button>
        </Link>
      </div>
    </div>
  );
};

export default LoyeHome;
