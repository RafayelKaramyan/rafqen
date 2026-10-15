import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Check } from 'lucide-react';
import {
  configSearch,
  defaultConfig,
  finishIds,
  finishes,
  products,
  type FinishId,
} from '../lib/catalog';
import { ProductPreview } from '../components/product-preview';
import { ProductCard } from '../components/product-card';
import { ButtonLink } from '../components/ui';
import { Anatomy } from '../components/anatomy';

export default function Home() {
  const [finish, setFinish] = useState<FinishId>('chalk');
  return (
    <>
      <section className="hero">
        <div className="hero-topline">
          <span>KEYBOARDS, CONSIDERED.</span>
          <span>STUDIO SERIES — 001</span>
        </div>
        <div className="hero-heading">
          <h1>
            Find your
            <br />
            <span>own rhythm.</span>
          </h1>
          <div className="hero-intro">
            <span className="small-star" aria-hidden="true">
              ✳
            </span>
            <p>
              A little more feel.
              <br />A little more you.
              <br />A better place to begin.
            </p>
            <ButtonLink to={`/configure/s75?${configSearch({ ...defaultConfig(), finish })}`}>
              Build your keyboard
            </ButtonLink>
          </div>
        </div>
        <div className="hero-product">
          <span className="hero-product-code">S / 75</span>
          <ProductPreview
            config={{ ...defaultConfig(), finish }}
            interactive
            className="hero-preview"
          />
          <div className="hero-product-note">
            <span className="eyebrow">THE STUDIO STANDARD</span>
            <span>
              Studio 75
              <br />
              <small>75% layout / {finishes[finish].name}</small>
            </span>
            <div className="hero-swatches" aria-label="Preview case finish">
              {finishIds.map((id) => (
                <button
                  key={id}
                  aria-label={`Preview ${finishes[id].name} finish`}
                  aria-pressed={finish === id}
                  onClick={() => setFinish(id)}
                  style={{ '--swatch': finishes[id].hex } as React.CSSProperties}
                >
                  {finish === id ? <Check size={12} /> : null}
                </button>
              ))}
            </div>
          </div>
          <span className="hero-axis" aria-hidden="true">
            − 01 / YOUR EVERYDAY, RECONSIDERED
          </span>
        </div>
        <div className="hero-bottom">
          <span>
            <span className="status-dot" />A keyboard concept. Made to be explored.
          </span>
          <a
            href="#collection"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('collection')?.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'instant'
                  : 'smooth',
              });
            }}
          >
            Meet the collection
            <ArrowDown size={14} />
          </a>
        </div>
      </section>
      <section id="collection" className="collection-section section-space">
        <div className="section-kicker">
          <span>01 / FIND YOUR FORMAT</span>
          <span>THREE SIZES. ONE POINT OF VIEW.</span>
        </div>
        <div className="section-title-row">
          <h2>
            A place on
            <br />
            your desk.
          </h2>
          <div>
            <p className="section-description">
              The same attention to detail.
              <br />A little more or less room to make it yours.
            </p>
            <ButtonLink to="/collection" variant="text">
              Explore the collection
            </ButtonLink>
          </div>
        </div>
        <div className="product-grid">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              config={{
                ...defaultConfig(product.id),
                finish: i === 1 ? 'ink' : i === 2 ? 'moss' : 'chalk',
                caps: i === 1 ? 'contrast' : 'tonal',
              }}
              index={i}
            />
          ))}
        </div>
      </section>
      <Anatomy />
      <section className="finish-story">
        <div className="finish-story-heading">
          <span className="eyebrow">03 / PUT YOUR OWN SPIN ON IT</span>
          <h2>
            Quiet tones.
            <br />
            Loud personality.
          </h2>
          <p>
            Chalk. Ink. Moss. Copper.
            <br />
            The finish is just the beginning.
          </p>
          <ButtonLink to="/configure/s75" variant="outline">
            Make it your own
          </ButtonLink>
        </div>
        <div className="finish-samples">
          {finishIds.map((id, i) => (
            <Link
              to={`/configure/s75?finish=${id}&caps=tonal&switches=linear`}
              key={id}
              className={`finish-sample finish-${id}`}
              style={{ '--finish': finishes[id].hex } as React.CSSProperties}
            >
              <span>0{i + 1}</span>
              <div className="sample-cap">
                <span>{['R', 'A', 'F', 'Q'][i]}</span>
              </div>
              <div>
                <h3>{finishes[id].name}</h3>
                <ArrowUpRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="closing-note">
        <span className="small-star" aria-hidden="true">
          ✳
        </span>
        <p>
          Good tools get out of your way.
          <br />
          Great ones feel like part of you.
        </p>
        <ButtonLink to="/configure/s75" variant="text">
          Find your combination
        </ButtonLink>
      </section>
    </>
  );
}
