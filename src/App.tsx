import { BrowserRouter, Routes, Route, NavLink, Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo">ASC</div>
        <div>
          <h1>Boutique AS Casinca</h1>
          <div className="sub">Saison 2025-2026</div>
        </div>
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

function Placeholder({ titre }: { titre: string }) {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>{titre}</h2>
      <p className="muted">Écran à venir — squelette en place (P0). ✅</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Placeholder titre="Joueurs" />} />
          <Route path="cheques" element={<Placeholder titre="Chèques / dépôts" />} />
          <Route path="stock" element={<Placeholder titre="Stock & approvisionnement" />} />
          <Route path="parametres" element={<Placeholder titre="Paramètres" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
