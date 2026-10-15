import { Component, useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowUpRight, Heart, Menu, ShoppingBag } from 'lucide-react';
import { Brand, Button, ButtonLink, Empty, Modal, Notice } from './components/ui';
import { CartDrawer } from './components/cart';
import { resetStore, useShop } from './lib/store';
import { useAction } from './lib/hooks';
import Home from './pages/home';
import Collection from './pages/collection';
import Configure from './pages/configure';
import Checkout from './pages/checkout';
import OrderPage from './pages/order';
import Studio from './pages/studio';

class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="page-wrap">
        <Empty title="A little interruption.">
          <p>The page could not be displayed. Your saved bag has not been cleared.</p>
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
        </Empty>
      </main>
    ) : (
      this.props.children
    );
  }
}
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    const title = pathname.startsWith('/configure')
      ? 'Build your keyboard'
      : pathname === '/collection'
        ? 'The Studio collection'
        : pathname === '/checkout'
          ? 'Demo checkout'
          : pathname.startsWith('/order')
            ? 'Your demo orders'
            : pathname === '/studio'
              ? 'The Studio study'
              : 'Find your own rhythm';
    document.title = `${title} — Rafqen`;
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>('h1')?.focus();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    const sections = document.querySelectorAll(
      '.section-space,.finish-story,.closing-note,.configure-bottom,.studio-notes',
    );
    sections.forEach((section) => {
      section.classList.add('reveal');
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
export function App() {
  const { data, issue } = useShop(),
    [bag, setBag] = useState(false),
    [menu, setMenu] = useState(false),
    [reset, setReset] = useState(false),
    action = useAction();
  const count = data.cart.reduce((sum, line) => sum + line.quantity, 0);
  return (
    <AppBoundary>
      <RouteEffects />
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="announcement">
        <span>A STUDIO FOR YOUR EVERYDAY.</span>
        <span>
          Independent portfolio experience <span aria-hidden="true">↗</span>
        </span>
      </div>
      <header className="site-header">
        <Link to="/" aria-label="Rafqen home">
          <Brand />
        </Link>
        <nav className="desktop-navigation" aria-label="Main navigation">
          <NavLink to="/collection">Keyboards</NavLink>
          <NavLink to="/configure/s75">Make it yours</NavLink>
          <NavLink to="/studio">The studio</NavLink>
        </nav>
        <div className="header-actions">
          <Link
            className="icon-button saved-nav"
            to="/collection?saved=1"
            aria-label={`Saved builds, ${data.saved.length}`}
          >
            <Heart size={19} />
            {data.saved.length ? <span className="saved-count">{data.saved.length}</span> : null}
          </Link>
          <button
            className="bag-button"
            aria-label={`Open bag, ${count} ${count === 1 ? 'item' : 'items'}`}
            onClick={() => setBag(true)}
          >
            <span>Bag</span>
            <ShoppingBag size={17} />
            <span className="bag-count">{String(count).padStart(2, '0')}</span>
          </button>
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            aria-expanded={menu}
            onClick={() => setMenu(true)}
          >
            <Menu size={21} />
          </button>
        </div>
      </header>
      {issue ? (
        <div className="storage-banner">
          <Notice>{issue}</Notice>
          <Button variant="outline" onClick={() => setReset(true)}>
            Reset demo data
          </Button>
        </div>
      ) : null}
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/configure/:model" element={<Configure openBag={() => setBag(true)} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/studio" element={<Studio />} />
          <Route
            path="*"
            element={
              <div className="page-wrap">
                <Empty title="A different starting point.">
                  <p>The page you were looking for is not here.</p>
                  <ButtonLink to="/collection">Explore the collection</ButtonLink>
                </Empty>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <Link to="/" aria-label="Rafqen home">
              <Brand />
            </Link>
            <p>
              A little more feel.
              <br />A little more you.
            </p>
          </div>
          <div className="footer-nav">
            <div>
              <span>EXPLORE</span>
              <Link to="/collection">The collection</Link>
              <Link to="/configure/s75">Build your keyboard</Link>
              <Link to="/collection?saved=1">Saved builds</Link>
            </div>
            <div>
              <span>THE STUDIO</span>
              <Link to="/studio">About the study</Link>
              <Link to="/orders">Your demo orders</Link>
              <a href="https://github.com/RafayelKaramyan/rafqen" target="_blank" rel="noreferrer">
                Source & project notes
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            Rafqen is a fictional keyboard brand.
            <br />
            An original portfolio project by <strong>Rafayel Karamyan</strong>. Demo orders only.
          </p>
          <button className="footer-reset" onClick={() => setReset(true)}>
            Reset demo data
          </button>
          <span>
            STUDIO SERIES / 001
            <br />
            DESIGNED TO BE EXPLORED.
          </span>
        </div>
      </footer>
      {bag ? <CartDrawer onClose={() => setBag(false)} /> : null}
      {menu ? (
        <Modal title="Explore Rafqen" onClose={() => setMenu(false)}>
          <nav className="mobile-navigation" aria-label="Mobile navigation">
            {[
              ['/collection', 'The collection'],
              ['/configure/s75', 'Make it yours'],
              ['/studio', 'The studio'],
              ['/collection?saved=1', 'Saved builds'],
              ['/orders', 'Your demo orders'],
            ].map(([to, label]) => (
              <Link key={to} to={to!} onClick={() => setMenu(false)}>
                {label}
                <ArrowUpRight size={22} />
              </Link>
            ))}
          </nav>
        </Modal>
      ) : null}
      {reset ? (
        <Modal
          title="A fresh starting point?"
          onClose={() => {
            if (!action.pending) setReset(false);
          }}
        >
          <p className="reset-copy">
            This replaces your bag, saved builds and demo order history in this browser. Keep your
            data if you want to return to it later.
          </p>
          {action.error ? <Notice>{action.error}</Notice> : null}
          <div className="modal-actions">
            <Button variant="outline" disabled={action.pending} onClick={() => setReset(false)}>
              Keep my data
            </Button>
            <Button
              loading={action.pending}
              onClick={() =>
                void action.run(async () => {
                  await resetStore();
                  setReset(false);
                  setBag(false);
                })
              }
            >
              Reset demo data
            </Button>
          </div>
        </Modal>
      ) : null}
    </AppBoundary>
  );
}
