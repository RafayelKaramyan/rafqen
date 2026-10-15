import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2, X, Truck } from 'lucide-react';
import {
  capSets,
  configId,
  configSearch,
  finishes,
  getProduct,
  money,
  switches,
  unitPrice,
} from '../lib/catalog';
import {
  adjustQuantity,
  cartTotals,
  MAX_QUANTITY,
  setQuantity,
  type CartLine,
  type ShopState,
} from '../lib/commerce';
import { mutateStore, useShop } from '../lib/store';
import { useAction } from '../lib/hooks';
import { Button, Empty, Modal, Notice } from './ui';
import { KeyboardIllustration } from './keyboard-illustration';

export function LineDescription({ line }: { line: CartLine }) {
  return (
    <span>
      {finishes[line.config.finish].name} / {capSets[line.config.caps].name} /{' '}
      {switches[line.config.switches].name}
    </span>
  );
}
export function PriceSummary({
  state,
}: {
  state: Pick<ShopState, 'cart' | 'coupon' | 'delivery'>;
}) {
  const totals = cartTotals(state);
  return (
    <dl className="price-summary">
      <div>
        <dt>Subtotal</dt>
        <dd>{money(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 ? (
        <div className="discount">
          <dt>STUDIO10 · 10% off</dt>
          <dd>−{money(totals.discount)}</dd>
        </div>
      ) : null}
      <div>
        <dt>{state.delivery === 'express' ? 'Express delivery' : 'Standard delivery'}</dt>
        <dd>{totals.shipping ? money(totals.shipping) : 'Included'}</dd>
      </div>
      <div className="price-total">
        <dt>
          Total <small>USD</small>
        </dt>
        <dd>{money(totals.total)}</dd>
      </div>
    </dl>
  );
}
export function Coupon() {
  const { data } = useShop(),
    action = useAction();
  const [value, setValue] = useState('');
  return (
    <div className="coupon-area">
      {data.coupon ? (
        <div className="applied-coupon">
          <span>STUDIO10 applied</span>
          <button
            className="icon-button"
            aria-label="Remove promo code"
            disabled={action.pending}
            onClick={() => void action.run(() => mutateStore((s) => ({ ...s, coupon: null })))}
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <form
          className="coupon-form"
          onSubmit={(e) => {
            e.preventDefault();
            void action.run(async () => {
              if (value.trim().toUpperCase() !== 'STUDIO10')
                throw new Error('That code is not available. Try STUDIO10 for this demo.');
              await mutateStore((s) => ({ ...s, coupon: 'STUDIO10' }));
            });
          }}
        >
          <label className="sr-only" htmlFor="promo-code">
            Promo code
          </label>
          <input
            id="promo-code"
            placeholder="Promo code"
            value={value}
            maxLength={30}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button variant="outline" type="submit" loading={action.pending}>
            Apply
          </Button>
        </form>
      )}
      {action.error ? <Notice>{action.error}</Notice> : null}
      <p className="fine-print">A little extra: use STUDIO10 for 10% off this demo.</p>
    </div>
  );
}
export function CartDrawer({ onClose }: { onClose: () => void }) {
  const { data } = useShop(),
    action = useAction();
  const count = data.cart.reduce((n, l) => n + l.quantity, 0),
    totals = cartTotals(data);
  return (
    <Modal
      title={`Your bag (${count})`}
      drawer
      onClose={() => {
        if (!action.pending) onClose();
      }}
    >
      {!data.cart.length ? (
        <Empty title="Room for something good.">
          <p>Find the keyboard that feels like yours.</p>
          <Link className="button button-solid" to="/collection" onClick={onClose}>
            Explore keyboards <ArrowRight size={17} />
          </Link>
        </Empty>
      ) : (
        <>
          <p className="bag-intro">A few good choices, coming together.</p>
          <div className="bag-lines">
            {data.cart.map((line) => {
              const id = configId(line.config),
                product = getProduct(line.config.model)!,
                label = `${product.name}, ${finishes[line.config.finish].name}, ${capSets[line.config.caps].name}, ${switches[line.config.switches].name}`;
              return (
                <article className="bag-line" key={id}>
                  <Link
                    className="bag-thumb"
                    to={`/configure/${product.id}?${configSearch(line.config)}`}
                    onClick={onClose}
                  >
                    <KeyboardIllustration config={line.config} />
                  </Link>
                  <div className="bag-line-body">
                    <div className="bag-line-top">
                      <Link
                        to={`/configure/${product.id}?${configSearch(line.config)}`}
                        onClick={onClose}
                      >
                        {product.name}
                      </Link>
                      <span>{money(unitPrice(line.config) * line.quantity)}</span>
                    </div>
                    <p>
                      <LineDescription line={line} />
                    </p>
                    <div className="bag-line-bottom">
                      <div className="quantity">
                        <button
                          aria-label={`Decrease quantity of ${label}`}
                          disabled={action.pending}
                          onClick={() =>
                            void action.run(() => mutateStore((s) => adjustQuantity(s, id, -1)))
                          }
                        >
                          <Minus size={13} />
                        </button>
                        <span aria-label={`Quantity of ${label}`}>{line.quantity}</span>
                        <button
                          aria-label={`Increase quantity of ${label}`}
                          disabled={action.pending || line.quantity >= MAX_QUANTITY}
                          onClick={() =>
                            void action.run(() => mutateStore((s) => adjustQuantity(s, id, 1)))
                          }
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={`Remove ${label}`}
                        disabled={action.pending}
                        onClick={() =>
                          void action.run(() => mutateStore((s) => setQuantity(s, id, 0)))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {action.error ? <Notice>{action.error}</Notice> : null}
          <div className="bag-summary">
            <div className="shipping-hint">
              <Truck size={16} />
              <span>
                {totals.subtotal - totals.discount >= 25000
                  ? 'Standard delivery is included.'
                  : `${money(Math.max(0, 25000 - totals.subtotal + totals.discount))} away from included standard delivery.`}
              </span>
            </div>
            <Coupon />
            <PriceSummary state={data} />
            <Link className="button button-solid checkout-link" to="/checkout" onClick={onClose}>
              Continue to demo checkout <ArrowRight size={17} />
            </Link>
            <p className="fine-print">Portfolio preview. Products and orders are fictional.</p>
          </div>
        </>
      )}
    </Modal>
  );
}
