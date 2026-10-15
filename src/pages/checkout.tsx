import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { capSets, configId, finishes, getProduct, money, unitPrice } from '../lib/catalog';
import { checkout, customerSchema, type Customer, type Delivery } from '../lib/commerce';
import { mutateStore, updateStore, useShop } from '../lib/store';
import { useAction } from '../lib/hooks';
import { KeyboardIllustration } from '../components/keyboard-illustration';
import { Coupon, PriceSummary } from '../components/cart';
import { Button, ButtonLink, Empty, Input, Notice } from '../components/ui';

const emptyCustomer: Customer = {
  name: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'Armenia',
};
export default function Checkout() {
  const { data } = useShop(),
    navigate = useNavigate(),
    action = useAction();
  const [stage, setStage] = useState<1 | 2>(1),
    [form, setForm] = useState<Customer>(emptyCustomer),
    [fields, setFields] = useState<Record<string, string>>({});
  const formElement = useRef<HTMLFormElement>(null),
    stageHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    stageHeading.current?.focus();
  }, [stage]);
  if (!data.cart.length)
    return (
      <div className="page-wrap">
        <Empty title="Your bag comes first.">
          <p>Choose a Studio keyboard, then make it your own.</p>
          <ButtonLink to="/collection">Find your format</ButtonLink>
        </Empty>
      </div>
    );
  function change<K extends keyof Customer>(key: K, value: Customer[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setFields((current) => ({ ...current, [key]: '' }));
  }
  function review() {
    const result = customerSchema.safeParse(form);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message;
      setFields(errors);
      const first = formElement.current?.elements.namedItem(Object.keys(errors)[0]!);
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setForm(result.data);
    setFields({});
    setStage(2);
  }
  return (
    <div className="checkout-page page-wrap">
      <Link className="back-link" to="/collection">
        <ArrowLeft size={14} />
        Keep exploring
      </Link>
      <div className="checkout-heading">
        <div>
          <p className="eyebrow">ONE LAST THING</p>
          <h1>Make it yours.</h1>
        </div>
        <p>
          A complete checkout experience.
          <br />
          <strong>Demo orders only. No payment is collected.</strong>
        </p>
      </div>
      <ol className="checkout-steps" aria-label="Checkout progress">
        <li
          className={stage === 1 ? 'active' : 'complete'}
          aria-current={stage === 1 ? 'step' : undefined}
        >
          <span>{stage > 1 ? <Check size={13} /> : 1}</span>Your details
        </li>
        <li className={stage === 2 ? 'active' : ''} aria-current={stage === 2 ? 'step' : undefined}>
          <span>2</span>Review your build
        </li>
        <li>
          <span>3</span>Demo confirmation
        </li>
      </ol>
      <div className="checkout-layout">
        <section className="checkout-form-panel">
          <h2 tabIndex={-1} ref={stageHeading}>
            {stage === 1 ? 'A place to land.' : 'A final look.'}
          </h2>
          {stage === 1 ? (
            <form
              ref={formElement}
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                review();
              }}
            >
              <div className="sample-details">
                <p>Please use fictional details for this portfolio demo.</p>
                <Button
                  variant="text"
                  type="button"
                  onClick={() => {
                    setForm({
                      name: 'Demo Customer',
                      email: 'demo@example.test',
                      address: '12 Example Street',
                      city: 'Yerevan',
                      postalCode: '0001',
                      country: 'Armenia',
                    });
                    setFields({});
                  }}
                >
                  Use sample details
                </Button>
              </div>
              <div className="form-grid">
                <Input
                  label="Full name"
                  name="name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => change('name', e.target.value)}
                  maxLength={100}
                  error={fields.name}
                />
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => change('email', e.target.value)}
                  maxLength={254}
                  error={fields.email}
                />
                <Input
                  label="Street address"
                  name="address"
                  className="wide-input"
                  autoComplete="street-address"
                  required
                  value={form.address}
                  onChange={(e) => change('address', e.target.value)}
                  maxLength={150}
                  error={fields.address}
                />
                <Input
                  label="City"
                  name="city"
                  autoComplete="address-level2"
                  required
                  value={form.city}
                  onChange={(e) => change('city', e.target.value)}
                  maxLength={80}
                  error={fields.city}
                />
                <Input
                  label="Postal code"
                  name="postalCode"
                  autoComplete="postal-code"
                  required
                  value={form.postalCode}
                  onChange={(e) => change('postalCode', e.target.value)}
                  maxLength={15}
                  error={fields.postalCode}
                />
                <label className="field">
                  <span>Country</span>
                  <select
                    value={form.country}
                    autoComplete="country-name"
                    name="country"
                    onChange={(e) =>
                      change('country', customerSchema.shape.country.parse(e.target.value))
                    }
                  >
                    {customerSchema.shape.country.options.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset className="delivery-options">
                <legend>Delivery preference</legend>
                {(['standard', 'express'] as Delivery[]).map((value) => (
                  <label
                    className={`delivery-option ${data.delivery === value ? 'selected' : ''}`}
                    key={value}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={value}
                      checked={data.delivery === value}
                      onChange={() =>
                        void action.run(() => mutateStore((s) => ({ ...s, delivery: value })))
                      }
                    />
                    <span>
                      <strong>
                        {value === 'standard' ? 'Standard delivery' : 'Express delivery'}
                      </strong>
                      <small>
                        {value === 'standard'
                          ? 'Included on orders from $250 after discounts'
                          : 'A faster route for your fictional order'}
                      </small>
                    </span>
                    <span>{value === 'express' ? '$19' : 'From $9'}</span>
                  </label>
                ))}
              </fieldset>
              {action.error ? <Notice>{action.error}</Notice> : null}
              <Button type="submit" loading={action.pending}>
                Review your build <ArrowRight size={16} />
              </Button>
            </form>
          ) : (
            <div className="checkout-review">
              <div className="review-address">
                <span className="eyebrow">YOUR DEMO DETAILS</span>
                <p>
                  {form.name}
                  <br />
                  {form.address}
                  <br />
                  {form.city}, {form.postalCode}
                  <br />
                  {form.country}
                </p>
                <span>{form.email}</span>
                <Button variant="text" onClick={() => setStage(1)}>
                  Edit details
                </Button>
              </div>
              <div className="review-note">
                <LockKeyhole size={19} />
                <p>
                  This creates a demo order in this browser. No payment details are requested and no
                  emails are sent. Your contact and address fields are not saved.
                </p>
              </div>
              {action.error ? <Notice>{action.error}</Notice> : null}
              <Button
                loading={action.pending}
                onClick={() =>
                  void action.run(async () => {
                    const order = await updateStore((current) => {
                      const result = checkout(current, form, {
                        revision: data.revision,
                        generation: data.generation,
                      });
                      return { state: result.state, value: result.order };
                    });
                    navigate(`/order/${order.id}`, { replace: true });
                  })
                }
              >
                Place demo order <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </section>
        <aside className="checkout-order">
          <span className="eyebrow">YOUR STUDIO SELECTION</span>
          <div className="order-lines">
            {data.cart.map((line) => (
              <article className="checkout-line" key={configId(line.config)}>
                <div>
                  <KeyboardIllustration config={line.config} decorative />
                </div>
                <section>
                  <h3>{getProduct(line.config.model)!.name}</h3>
                  <p>
                    {finishes[line.config.finish].name} / {capSets[line.config.caps].name}
                  </p>
                  <span>Qty {line.quantity}</span>
                </section>
                <strong>{money(unitPrice(line.config) * line.quantity)}</strong>
              </article>
            ))}
          </div>
          <Coupon />
          <PriceSummary state={data} />
        </aside>
      </div>
    </div>
  );
}
