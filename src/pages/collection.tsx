import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import {
  defaultConfig,
  getProduct,
  money,
  products,
  unitPrice,
  type ModelId,
} from '../lib/catalog';
import { useShop } from '../lib/store';
import { ProductCard } from '../components/product-card';
import { Button, ButtonLink, Empty, Modal } from '../components/ui';
import { KeyboardIllustration } from '../components/keyboard-illustration';

export default function Collection() {
  const [params, setParams] = useSearchParams(),
    { data } = useShop();
  const [compare, setCompare] = useState<ModelId[]>([]),
    [comparing, setComparing] = useState(false);
  const query = params.get('q') ?? '',
    format = params.get('format') ?? '',
    saved = params.get('saved') === '1',
    sort = params.get('sort') ?? 'featured';
  function filter(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  const items = (saved ? data.saved : products.map((product) => defaultConfig(product.id)))
    .filter((config) => {
      const product = getProduct(config.model)!;
      return (
        (!format || product.format === format) &&
        `${product.name} ${product.format} ${product.title}`
          .toLowerCase()
          .includes(query.toLowerCase().trim())
      );
    })
    .sort((a, b) =>
      sort === 'price-low'
        ? unitPrice(a) - unitPrice(b)
        : sort === 'price-high'
          ? unitPrice(b) - unitPrice(a)
          : 0,
    );
  const selected = compare.map((id) => getProduct(id)!);
  return (
    <div className={`collection-page page-wrap ${compare.length ? 'with-compare' : ''}`}>
      <div className="page-kicker">
        <span>THE STUDIO COLLECTION</span>
        <span>MADE TO FIND YOUR FIT.</span>
      </div>
      <div className="collection-heading">
        <h1>
          Your desk.
          <br />
          <span>Your format.</span>
        </h1>
        <p>
          Three considered layouts.
          <br />A whole lot of ways to make one yours.
        </p>
      </div>
      <div className="collection-toolbar">
        <div className="collection-tabs" aria-label="Collection view">
          <button
            className={!saved ? 'active' : ''}
            onClick={() => filter('saved', '')}
            aria-pressed={!saved}
          >
            All keyboards <span>03</span>
          </button>
          <button
            className={saved ? 'active' : ''}
            onClick={() => filter('saved', '1')}
            aria-pressed={saved}
          >
            Saved builds <span>{String(data.saved.length).padStart(2, '0')}</span>
          </button>
        </div>
        <div className="collection-controls">
          <label className="search-field">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Search keyboards</span>
            <input
              value={query}
              maxLength={80}
              placeholder="Find your format…"
              onChange={(e) => filter('q', e.target.value)}
            />
          </label>
          <label className="sr-only" htmlFor="format-filter">
            Filter layout
          </label>
          <select
            id="format-filter"
            value={format}
            onChange={(e) => filter('format', e.target.value)}
          >
            <option value="">All layouts</option>
            {products.map((p) => (
              <option value={p.format} key={p.id}>
                {p.format} layout
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="sort-keyboards">
            Sort keyboards
          </label>
          <select id="sort-keyboards" value={sort} onChange={(e) => filter('sort', e.target.value)}>
            <option value="featured">Studio order</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </div>
      </div>
      <p className="results-count" role="status">
        {items.length} {items.length === 1 ? 'keyboard' : 'keyboards'}
        {saved ? ' saved' : ''}
      </p>
      {items.length ? (
        <div className="product-grid">
          {items.map((config, i) => (
            <ProductCard
              config={config}
              key={`${config.model}-${config.finish}-${config.caps}-${config.switches}`}
              index={i}
              comparison={compare.includes(config.model)}
              onCompare={(id) =>
                setCompare((previous) =>
                  previous.includes(id)
                    ? previous.filter((item) => item !== id)
                    : [...previous, id],
                )
              }
            />
          ))}
        </div>
      ) : (
        <Empty
          title={
            saved && !query && !format
              ? 'A little inspiration, saved.'
              : 'Nothing in this combination.'
          }
        >
          <p>
            {saved && !query && !format
              ? 'Tap the heart on a keyboard or save your own configuration.'
              : 'Try a different format or search term.'}
          </p>
          {query || format ? (
            <Button
              variant="outline"
              onClick={() => setParams(saved ? { saved: '1' } : {}, { replace: true })}
            >
              Clear filters
            </Button>
          ) : (
            <ButtonLink to="/collection">Explore keyboards</ButtonLink>
          )}
        </Empty>
      )}
      <div className="collection-footer-note">
        <span className="small-star" aria-hidden="true">
          ✳
        </span>
        <p>
          Same attention. Different proportions.
          <br />
          Compare the formats to find your starting point.
        </p>
        <Button variant="text" disabled={compare.length < 2} onClick={() => setComparing(true)}>
          Compare selected ({compare.length}) <ArrowRight size={17} />
        </Button>
      </div>
      {compare.length ? (
        <div className="compare-dock">
          <span>{compare.length} formats selected</span>
          <div>
            {selected.map((p) => (
              <span className="compare-chip" key={p.id}>
                {p.name}
                <button
                  aria-label={`Remove ${p.name} from comparison`}
                  onClick={() => setCompare((ids) => ids.filter((id) => id !== p.id))}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <Button disabled={compare.length < 2} onClick={() => setComparing(true)}>
            Compare <ArrowRight size={15} />
          </Button>
          <button
            className="icon-button"
            aria-label="Clear comparison"
            onClick={() => setCompare([])}
          >
            <X size={17} />
          </button>
        </div>
      ) : null}
      {comparing ? (
        <Modal title="Find your format." onClose={() => setComparing(false)}>
          <p className="compare-intro">
            A closer look at the Studio layouts. All specifications describe fictional concept
            products.
          </p>
          <div className="table-scroll">
            <table className="compare-table">
              <caption className="sr-only">Compare Studio keyboard formats</caption>
              <thead>
                <tr>
                  <th scope="col">The details</th>
                  {selected.map((p) => (
                    <th key={p.id} scope="col">
                      <KeyboardIllustration config={defaultConfig(p.id)} decorative />
                      <span>{p.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Layout', ...selected.map((p) => p.format)],
                  ['Keys', ...selected.map((p) => String(p.keys))],
                  ['Width', ...selected.map((p) => `${p.width} mm`)],
                  ['Depth', ...selected.map((p) => `${p.depth} mm`)],
                  ['Weight', ...selected.map((p) => p.weight)],
                  ['Connection', ...selected.map(() => 'USB-C / wired')],
                  ['Starting at', ...selected.map((p) => money(p.price))],
                ].map((row) => (
                  <tr key={row[0]}>
                    <th scope="row">{row[0]}</th>
                    {row.slice(1).map((value, i) => (
                      <td key={i}>{value}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">Make it yours</th>
                  {selected.map((p) => (
                    <td key={p.id}>
                      <span onClick={() => setComparing(false)}>
                        <ButtonLink to={`/configure/${p.id}`} variant="text">
                          Build {p.format}
                        </ButtonLink>
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
