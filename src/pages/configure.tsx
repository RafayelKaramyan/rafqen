import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Heart, Link2, Package, Truck } from 'lucide-react';
import {
  capIds,
  capSets,
  configFromSearch,
  configId,
  configSearch,
  finishIds,
  finishes,
  getProduct,
  money,
  products,
  switchIds,
  switches,
  unitPrice,
  type Configuration,
} from '../lib/catalog';
import { addLine, toggleSaved } from '../lib/commerce';
import { mutateStore, useShop } from '../lib/store';
import { useAction } from '../lib/hooks';
import { ProductPreview } from '../components/product-preview';
import { Button, ButtonLink, Empty, Notice } from '../components/ui';

export default function Configure({ openBag }: { openBag: () => void }) {
  const { model } = useParams(),
    product = getProduct(model ?? ''),
    [params, setParams] = useSearchParams();
  const { data } = useShop(),
    action = useAction(),
    [copied, setCopied] = useState(false);
  if (!product)
    return (
      <div className="page-wrap">
        <Empty title="That keyboard is not here.">
          <p>Start with one of the Studio formats.</p>
          <ButtonLink to="/collection">Explore keyboards</ButtonLink>
        </Empty>
      </div>
    );
  const config = configFromSearch(product.id, params),
    saved = data.saved.some((item) => configId(item) === configId(config));
  const invalid = (['finish', 'caps', 'switches'] as const).some(
    (key) => params.has(key) && params.get(key) !== config[key],
  );
  function change<K extends keyof Configuration>(key: K, value: Configuration[K]) {
    setParams(configSearch({ ...config, [key]: value }), { replace: true });
    setCopied(false);
  }
  return (
    <div className="configure-page">
      <div className="configure-topline page-wrap">
        <Link to="/collection">
          <ArrowLeft size={14} />
          The collection
        </Link>
        <span>YOUR KEYBOARD. YOUR CALL.</span>
        <button
          className="share-link"
          onClick={() =>
            void action.run(async () => {
              if (!navigator.clipboard)
                throw new Error('Copy the address in your browser to share this build.');
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
            })
          }
        >
          <Link2 size={14} />
          {copied ? 'Build link copied' : 'Share your build'}
        </button>
      </div>
      <div className="configure-layout">
        <div className="configure-gallery">
          <div className="gallery-label">
            <span>RAFQEN / STUDIO SERIES</span>
            <span>{product.format} FORMAT</span>
          </div>
          <ProductPreview config={config} interactive className="configure-preview" />
          <div className="gallery-colophon">
            <span>
              Designed to become
              <br />
              part of your everyday.
            </span>
            <strong>S/{product.format.replace('%', '')}</strong>
          </div>
          <div className="spec-strip">
            <span>
              <strong>{product.keys}</strong>keys
            </span>
            <span>
              <strong>{product.width}</strong>mm wide
            </span>
            <span>
              <strong>{product.weight}</strong>considered weight
            </span>
            <span>
              <strong>USB-C</strong>wired connection
            </span>
          </div>
        </div>
        <div className="configure-options">
          <div className="configure-title">
            <p className="eyebrow">{product.badge}</p>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
          </div>
          <div className="model-picker" aria-label="Choose keyboard format">
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/configure/${p.id}?${configSearch({ ...config, model: p.id })}`}
                className={p.id === product.id ? 'selected' : ''}
                aria-current={p.id === product.id ? 'page' : undefined}
              >
                {p.format}
              </Link>
            ))}
          </div>
          {invalid ? (
            <Notice>One option in this link was unavailable. The standard build is shown.</Notice>
          ) : null}
          <fieldset className="option-group">
            <legend>
              <span className="option-step">01</span>Case finish{' '}
              <span>{finishes[config.finish].name}</span>
            </legend>
            <div className="finish-options">
              {finishIds.map((id) => (
                <label
                  key={id}
                  className={`finish-option ${config.finish === id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="finish"
                    value={id}
                    checked={config.finish === id}
                    onChange={() => change('finish', id)}
                  />
                  <span className="finish-dot" style={{ background: finishes[id].hex }}>
                    {config.finish === id ? <Check size={15} /> : null}
                  </span>
                  <span>{finishes[id].name}</span>
                  <small>{finishes[id].price ? `+${money(finishes[id].price)}` : 'Included'}</small>
                </label>
              ))}
            </div>
            <p className="option-note">{finishes[config.finish].text}</p>
          </fieldset>
          <fieldset className="option-group">
            <legend>
              <span className="option-step">02</span>Keycap palette{' '}
              <span>{capSets[config.caps].name}</span>
            </legend>
            <div className="cap-options">
              {capIds.map((id) => (
                <label key={id} className={`cap-option ${config.caps === id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="caps"
                    value={id}
                    checked={config.caps === id}
                    onChange={() => change('caps', id)}
                  />
                  <span className="cap-mini" aria-hidden="true">
                    <i style={{ background: capSets[id].mods }} />
                    <i style={{ background: capSets[id].main }} />
                    <i style={{ background: capSets[id].accent }} />
                  </span>
                  <span>{capSets[id].name}</span>
                  <small>{capSets[id].price ? `+${money(capSets[id].price)}` : 'Included'}</small>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="option-group">
            <legend>
              <span className="option-step">03</span>Switch feel{' '}
              <span>{switches[config.switches].force}</span>
            </legend>
            <div className="switch-options">
              {switchIds.map((id) => (
                <label
                  key={id}
                  className={`switch-option ${config.switches === id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="switches"
                    value={id}
                    checked={config.switches === id}
                    onChange={() => change('switches', id)}
                  />
                  <span className="radio-dot" />
                  <span>
                    <strong>{switches[id].name}</strong>
                    <small>{switches[id].text}</small>
                  </span>
                  <em>{switches[id].price ? `+${money(switches[id].price)}` : 'Included'}</em>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="build-summary">
            <div>
              <span className="eyebrow">YOUR COMBINATION</span>
              <p>
                {finishes[config.finish].name} / {capSets[config.caps].name} /{' '}
                {switches[config.switches].name}
              </p>
            </div>
            <button
              className={`icon-button ${saved ? 'is-saved' : ''}`}
              aria-label={saved ? 'Unsave this build' : 'Save this build'}
              aria-pressed={saved}
              disabled={action.pending}
              onClick={() => void action.run(() => mutateStore((s) => toggleSaved(s, config)))}
            >
              <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
            </button>
          </div>
          {action.error ? <Notice>{action.error}</Notice> : null}
          <div className="configure-purchase">
            <div className="build-price">
              <span>Total · USD</span>
              <output aria-label="Configuration price" aria-live="polite">
                {money(unitPrice(config))}
              </output>
            </div>
            <Button
              loading={action.pending}
              onClick={() =>
                void action.run(async () => {
                  await mutateStore((s) => addLine(s, config));
                  openBag();
                })
              }
            >
              Add to bag <ArrowRight size={18} />
            </Button>
          </div>
          <div className="purchase-notes">
            <span>
              <Package size={14} />
              Made for this demo
            </span>
            <span>
              <Truck size={14} />
              Standard delivery from $9
            </span>
          </div>
          <p className="fine-print">
            A fictional product, thoughtfully configured. Checkout creates a demo order.
          </p>
        </div>
      </div>
      <section className="configure-bottom page-wrap">
        <div>
          <span className="eyebrow">THE EVERYDAY DETAILS</span>
          <h2>
            Everything in
            <br />
            its right place.
          </h2>
        </div>
        <div className="details-list">
          <details open>
            <summary>A considered build</summary>
            <p>
              The Studio concept pairs a solid aluminum enclosure with a cushioned mounting system
              and textured PBT keycaps. The proportions change. The point of view stays the same.
            </p>
          </details>
          <details>
            <summary>Make the feel your own</summary>
            <p>
              Linear switches move smoothly through the press. Tactile switches add a gentle bump.
              Silent switches cushion the landing. Choose a feel and see the complete configuration
              before adding it to your bag.
            </p>
          </details>
          <details>
            <summary>About this concept</summary>
            <p>
              Rafqen is an independent portfolio project by Rafayel Karamyan. The keyboards,
              specifications, prices and orders are fictional. No purchase is made and no payment is
              collected.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
