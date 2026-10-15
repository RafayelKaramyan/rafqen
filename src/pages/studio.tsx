import { ArrowUpRight } from 'lucide-react';
import { Anatomy } from '../components/anatomy';
import { defaultConfig } from '../lib/catalog';
import { KeyboardIllustration } from '../components/keyboard-illustration';
import { ButtonLink } from '../components/ui';

export default function Studio() {
  return (
    <div className="studio-page">
      <section className="studio-intro page-wrap">
        <p className="eyebrow">AN INDEPENDENT PRODUCT STUDY</p>
        <h1>
          Objects for
          <br />
          long afternoons.
        </h1>
        <div className="studio-intro-copy">
          <span className="small-star" aria-hidden="true">
            ✳
          </span>
          <p>
            A keyboard sits between an idea and everything you make of it. Rafqen is a concept built
            around that small, everyday relationship.
          </p>
          <p>
            Three layouts. A few considered materials. Enough choice to make the object personal,
            with a clear path from the first look to the final combination.
          </p>
        </div>
        <div className="studio-product">
          <KeyboardIllustration
            config={{ ...defaultConfig(), finish: 'moss', caps: 'signal' }}
            decorative
          />
          <span>THE STUDIO 75 / MOSS & SIGNAL</span>
        </div>
      </section>
      <div className="page-wrap">
        <Anatomy />
      </div>
      <section className="studio-notes page-wrap">
        <div>
          <p className="eyebrow">THE PROJECT BEHIND THE PRODUCT</p>
          <h2>
            Considered
            <br />
            from end to end.
          </h2>
        </div>
        <div>
          <p>
            Rafqen is an original portfolio project by Rafayel Karamyan. The visual identity,
            product illustrations, procedural 3D keyboard and shopping experience were developed for
            this project.
          </p>
          <p>
            The products, specifications and pricing are fictional. The configurator, saved builds,
            comparison, shopping bag and demo checkout are interactive. Orders stay in the current
            browser.
          </p>
          <a
            className="button button-text"
            href="https://github.com/RafayelKaramyan/rafqen"
            target="_blank"
            rel="noreferrer"
          >
            Explore the project
            <ArrowUpRight size={17} />
          </a>
          <ButtonLink to="/configure/s75" variant="text">
            Build your combination
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
