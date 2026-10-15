import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Check } from 'lucide-react';
import { capSets, configId, finishes, getProduct, money } from '../lib/catalog';
import { useShop } from '../lib/store';
import { ButtonLink, Empty } from '../components/ui';
import { KeyboardIllustration } from '../components/keyboard-illustration';

export default function OrderPage() {
  const { id } = useParams(),
    { data } = useShop();
  if (!id)
    return (
      <div className="orders-page page-wrap">
        <p className="eyebrow">YOUR PREVIOUS COMBINATIONS</p>
        <h1>Demo orders.</h1>
        {data.orders.length ? (
          <div className="order-history">
            {data.orders.map((order) => (
              <Link to={`/order/${order.id}`} key={order.id}>
                <span>
                  <small>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </small>
                  <strong>Studio order / {order.id.slice(0, 8).toUpperCase()}</strong>
                </span>
                <span>{order.lines.reduce((sum, l) => sum + l.quantity, 0)} keyboards</span>
                <strong>{money(order.total)}</strong>
                <ArrowUpRight size={20} />
              </Link>
            ))}
          </div>
        ) : (
          <Empty title="Your first combination is waiting.">
            <p>Completed demo orders will appear here.</p>
            <ButtonLink to="/collection">Explore keyboards</ButtonLink>
          </Empty>
        )}
      </div>
    );
  const order = data.orders.find((item) => item.id === id);
  if (!order)
    return (
      <div className="page-wrap">
        <Empty title="This order is not in this browser.">
          <p>Demo orders are saved on the device where they were created.</p>
          <ButtonLink to="/orders">View your demo orders</ButtonLink>
        </Empty>
      </div>
    );
  return (
    <div className="confirmation-page page-wrap">
      <span className="confirmation-check">
        <Check size={26} />
      </span>
      <p className="eyebrow">A GOOD COMBINATION</p>
      <h1>
        Your studio is
        <br />
        taking shape.
      </h1>
      <p className="confirmation-intro">
        Your demo order has been created.
        <br />
        Nothing was charged. Nothing will be shipped.
      </p>
      <div className="confirmation-reference">
        <span>DEMO ORDER / {order.id.slice(0, 8).toUpperCase()}</span>
        <span>
          {new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      </div>
      <div className="confirmed-lines">
        {order.lines.map((line) => (
          <article key={configId(line.config)}>
            <KeyboardIllustration config={line.config} decorative />
            <div>
              <h2>{getProduct(line.config.model)!.name}</h2>
              <p>
                {finishes[line.config.finish].name} / {capSets[line.config.caps].name} /{' '}
                {line.config.switches}
              </p>
              <span>Quantity {line.quantity}</span>
            </div>
            <strong>{money(line.unitPrice * line.quantity)}</strong>
          </article>
        ))}
      </div>
      <dl className="confirmation-totals">
        <div>
          <dt>Subtotal</dt>
          <dd>{money(order.subtotal)}</dd>
        </div>
        {order.discount ? (
          <div>
            <dt>Studio discount</dt>
            <dd>−{money(order.discount)}</dd>
          </div>
        ) : null}
        <div>
          <dt>{order.delivery === 'express' ? 'Express' : 'Standard'} delivery</dt>
          <dd>{order.shipping ? money(order.shipping) : 'Included'}</dd>
        </div>
        <div>
          <dt>Demo total</dt>
          <dd>{money(order.total)}</dd>
        </div>
      </dl>
      <div className="confirmation-actions">
        <ButtonLink to="/collection">Keep exploring</ButtonLink>
        <ButtonLink to="/orders" variant="text">
          Your demo orders
        </ButtonLink>
      </div>
      <p className="fine-print">This is an independent portfolio experience by Rafayel Karamyan.</p>
    </div>
  );
}
