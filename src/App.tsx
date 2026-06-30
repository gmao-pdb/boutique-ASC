import { BrowserRouter, Routes, Route, NavLink, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Login from "./pages/Login";
import Joueurs from "./pages/Joueurs";
import FicheJoueur from "./pages/FicheJoueur";
import Cheques from "./pages/Cheques";
import Stock from "./pages/Stock";
import Parametres from "./pages/Parametres";

function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">ASC</div>
        <div style={{ flex: 1 }}>
          <h1>Boutique AS Casinca</h1>
          <div className="sub">Saison 2025-2026</div>
        </div>
        <button className="header-logout" onClick={logout} title={user?.email ?? ""}>Quitter</button>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="tabbar">
        <NavLink to="/" end><span className="ico">📋</span>Joueurs</NavLink>
        <NavLink to="/cheques"><span className="ico">💰</span>Chèques</NavLink>
        <NavLink to="/stock"><span className="ico">📦</span>Stock</NavLink>
        <NavLink to="/parametres"><span className="ico">⚙️</span>Réglages</NavLink>
      </nav>
    </div>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <div className="full-center muted">Chargement…</div>;
  if (!user) return <Login />;
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Joueurs />} />
          <Route path="joueur/:id" element={<FicheJoueur />} />
          <Route path="cheques" element={<Cheques />} />
          <Route path="stock" element={<Stock />} />
          <Route path="parametres" element={<Parametres />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
