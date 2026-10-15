import { Link } from 'react-router-dom';
import { ArrowUpRight, Heart, Check } from 'lucide-react';
import {
  capSets,
  configId,
  configSearch,
  finishes,
  getProduct,
  money,
  unitPrice,
  type Configuration,
  type ModelId,
} from '../lib/catalog';
import { toggleSaved } from '../lib/commerce';
import { mutateStore, useShop } from '../lib/store';
import { useAction } from '../lib/hooks';
import { KeyboardIllustration } from './keyboard-illustration';
import { Notice } from './ui';

export function ProductCard({
  config,
  index = 0,
  comparison,
  onCompare,
}: {
  config: Configuration;
  index?: number;
  comparison?: boolean;
  onCompare?: (id: ModelId) => void;
}) {
  const { data } = useShop(),
    action = useAction(),
    product = getProduct(config.model)!;
  const saved = data.saved.some((item) => configId(item) === configId(config));
  return (
    <article className={`product-card product-tone-${index % 3}`}>
      <div className="product-card-visual">
        <span className="card-edition">
          {product.format} / {product.keys} KEYS
        </span>
        <button
          className={`icon-button save-button ${saved ? 'is-saved' : ''}`}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name} in ${finishes[config.finish].name} with ${capSets[config.caps].name} keycaps`}
          aria-pressed={saved}
          disabled={action.pending}
          onClick={() => void action.run(() => mutateStore((s) => toggleSaved(s, config)))}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <Link
          to={`/configure/${product.id}?${configSearch(config)}`}
          aria-label={`Configure ${product.name} in ${finishes[config.finish].name}`}
        >
          <KeyboardIllustration config={config} />
        </Link>
        <span className="card-finish">
          {finishes[config.finish].name} / {capSets[config.caps].name}
        </span>
      </div>
      <div className="product-card-info">
        <div>
          <p className="eyebrow">{product.badge}</p>
          <h3>
            <Link to={`/configure/${product.id}?${configSearch(config)}`}>
              {product.name}
              <ArrowUpRight size={22} />
            </Link>
          </h3>
          <p>{product.title}</p>
        </div>
        <span className="card-price">{money(unitPrice(config))}</span>
      </div>
      {onCompare ? (
        <button
          className={`compare-choice ${comparison ? 'selected' : ''}`}
          onClick={() => onCompare(product.id)}
          aria-pressed={Boolean(comparison)}
        >
          <span>{comparison ? <Check size={12} /> : null}</span>Compare {product.name}
        </button>
      ) : null}
      {action.error ? <Notice>{action.error}</Notice> : null}
    </article>
  );
}
