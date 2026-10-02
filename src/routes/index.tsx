import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";

import { RecentWork } from "@/components/site/RecentWork";
import { RecentPodcasts } from "@/components/site/RecentPodcasts";
import { RecentResources } from "@/components/site/RecentResources";
import { RecentNews } from "@/components/site/RecentNews";
import { Footer } from "@/components/site/Footer";
import { Reveal } from "@/components/site/Reveal";
import {
  SITE_NAME,
  DEFAULT_TITLE,
  HOME_DESCRIPTION,
  KEYWORDS,
  OG_IMAGE,
  SITE_CONTACT,
  SOCIAL_LINKEDIN,
  absolutize,
  seo,
  siteUrl,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const { meta, links } = seo({
      title: DEFAULT_TITLE,
      description: HOME_DESCRIPTION,
      keywords: KEYWORDS,
      path: "/",
    });
    const url = siteUrl();

    // ── 1. WebSite schema
    const websiteJsonLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${url}#website`,
      name: SITE_NAME,
      alternateName: ["Her Namibia", "Her Namibia Platform", "Pricilla Mukokobi"],
      url: url,
      description: HOME_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${url}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${url}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    };

    // ── 2. Organization schema
    const orgJsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${url}#organization`,
      name: SITE_NAME,
      alternateName: ["Her Namibia", "Her Namibia Platform"],
      founder: {
        "@type": "Person",
        name: "Pricilla Mukokobi",
        jobTitle: "Founder & Host",
      },
      url: url,
      logo: {
        "@type": "ImageObject",
        url: absolutize("/her-namibia-logo.png"),
        width: "400",
        height: "400",
      },
      image: absolutize(OG_IMAGE),
      description: HOME_DESCRIPTION,
      foundingDate: "2024",
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE_CONTACT.addressLocality,
        addressRegion: SITE_CONTACT.addressRegion,
        addressCountry: SITE_CONTACT.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE_CONTACT.geo.latitude,
        longitude: SITE_CONTACT.geo.longitude,
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: SITE_CONTACT.telephone,
          email: SITE_CONTACT.email,
          contactType: "customer service",
          areaServed: ["NA"],
          availableLanguage: ["English"],
        },
      ],
      sameAs: [SOCIAL_LINKEDIN, url],
      areaServed: [
        { "@type": "Country", name: "Namibia" },
      ],
      knowsAbout: [
        "Women's Stories",
        "Leadership Development",
        "Motherhood",
        "Business Development",
        "Health and Wellness",
        "Cultural Preservation",
        "Women Empowerment",
        "Podcast Production",
      ],
    };

    // ── 3. BreadcrumbList schema
    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: url,
        },
      ],
    };

    return {
      meta: [
        ...meta,
        { name: "geo.region", content: "NA-KH" },
        { name: "geo.placename", content: "Windhoek, Namibia" },
        { name: "geo.position", content: "-22.5609;17.0898" },
        { name: "ICBM", content: "-22.5609,17.0898" },
        { name: "classification", content: "Women's Platform & Podcast" },
        { name: "category", content: "Women Stories, Empowerment, Podcast, Namibia" },
        { name: "coverage", content: "Namibia" },
        { name: "target", content: "all" },
        { name: "HandheldFriendly", content: "True" },
        { name: "MobileOptimized", content: "320" },
      ],
      links,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify([websiteJsonLd, orgJsonLd, breadcrumbJsonLd]),
        },
      ],
    };
  },
  component: Index,
});

const FEATURED_STORIES = [
  {
    title: "Business",
    description: "Entrepreneurial journeys and business leadership stories",
    image: "/images/stories/business.jpg",
  },
  {
    title: "Leadership",
    description: "Women leading change in their communities and industries",
    image: "/images/stories/leadership.jpg",
  },
  {
    title: "Health",
    description: "Healthcare professionals and wellness advocates",
    image: "/images/stories/health.jpg",
  },
  {
    title: "Motherhood",
    description: "Balancing family life with professional achievements",
    image: "/images/stories/motherhood.jpg",
  },
  {
    title: "Culture",
    description: "Preserving and celebrating Namibian heritage",
    image: "/images/stories/culture.jpg",
  },
  {
    title: "Young Women",
    description: "Rising stars making their mark early",
    image: "/images/stories/young-women.jpg",
  },
];

const WOMAN_OF_MONTH = {
  name: "Pricilla Mukokobi",
  title: "Founder & Host of Her Namibia",
  image: "/images/priscilla-1.jpeg",
  story: "Pricilla Mukokobi is the visionary behind Her Namibia, a platform celebrating women's voices and experiences across Namibia. Through meaningful conversations and storytelling, she highlights the journeys, challenges, and achievements of women from all walks of life, inspiring positive change and connecting women across different backgrounds.",
  achievements: [
    "Platform Founder",
    "Podcast Host",
    "Women's Advocate",
    "Community Builder",
  ],
};

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen hero-gradient overflow-hidden">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid min-h-[100svh] grid-cols-1 items-center gap-8 pb-12 pt-28 lg:grid-cols-2 lg:gap-12 lg:py-20">
              {/* Left Content */}
              <div className="flex flex-col justify-center">
                <p className="animate-fade-up flex flex-wrap items-center gap-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
                  <span className="hidden h-px w-12 bg-accent sm:block" aria-hidden />
                  Her Story · Her Voice · Her Impact
                </p>

                <h1 className="animate-fade-up mt-6 text-[clamp(1.85rem,8vw,3.75rem)] font-bold leading-[1.1] text-primary" style={{ animationDelay: "0.12s" }}>
                  <span className="block">Every woman has</span>
                  <span className="mt-1 block text-accent italic font-light sm:mt-2">a story worth hearing.</span>
                </h1>

                <p
                  className="animate-fade-up mt-8 max-w-lg border-l-2 border-accent pl-5 text-lg leading-relaxed text-muted-foreground"
                  style={{ animationDelay: "0.24s" }}
                >
                  Her Namibia is a premium podcast and storytelling platform celebrating the voices, journeys and impact of Namibian women.
                </p>

                <ul className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "0.36s" }}>
                  {[
                    { label: "Real stories", tone: "story-pill-gold" },
                    { label: "Honest conversations", tone: "story-pill-green" },
                    { label: "Timeless inspiration", tone: "story-pill-coral" },
                  ].map((item) => (
                    <li
                      key={item.label}
                      className={`story-pill ${item.tone} rounded-full border border-accent/40 bg-background/70 px-4 py-2 text-xs font-semibold tracking-wide text-primary shadow-card`}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Image */}
              <div className="relative flex min-w-0 items-center justify-center px-4 py-8 lg:justify-end lg:px-8">
                <div className="pointer-events-none absolute inset-0" aria-hidden>
                  <div className="absolute right-[-18%] top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-primary shadow-2xl lg:h-[36rem] lg:w-[36rem]" />
                  <div className="absolute right-[6%] top-[14%] h-80 w-80 animate-spin-slow">
                    <div className="absolute inset-0 rounded-full border border-accent/40" />
                    <div className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-card" />
                  </div>
                  <div className="absolute right-[22%] top-[10%] h-16 w-16 rounded-full bg-accent/25 blur-[2px] animate-float" />
                  <div
                    className="absolute bottom-[16%] right-[4%] h-9 w-9 rounded-full border border-accent/50 animate-float"
                    style={{ animationDelay: "1.2s" }}
                  />
                </div>

                <div className="relative z-10 grid w-full min-w-0 max-w-sm animate-scale-in [grid-template-columns:minmax(0,1fr)]">
                  <div className="col-start-1 row-start-1 -z-10 hidden translate-x-4 translate-y-4 rounded-[2rem] bg-accent-gradient opacity-90 sm:block" />

                  <div className="relative col-start-1 row-start-1 overflow-hidden rounded-[1.75rem] shadow-lift ring-1 ring-accent/35">
                    <img
                      src="/images/priscilla-1.jpeg"
                      alt="Pricilla Mukokobi - Founder of Her Namibia"
                      className="block h-auto w-full max-w-full animate-slow-zoom object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/25 via-transparent to-transparent" />
                    <div className="pointer-events-none absolute inset-3 rounded-[1.35rem] border border-background/40" />
                  </div>

                  <div
                    className="col-start-1 row-start-1 z-20 m-3 justify-self-end self-start animate-fade-up lg:-mr-6 lg:mt-16"
                    style={{ animationDelay: "0.4s" }}
                  >
                    <div className="animate-float rounded-2xl border border-accent/30 bg-background/92 px-4 py-3 text-center shadow-lift backdrop-blur-md lg:px-5 lg:py-4">
                      <span className="mx-auto mb-2 block h-0.5 w-8 rounded-full bg-accent" />
                      <p className="text-base font-bold leading-tight text-primary lg:text-lg">
                        Pricilla
                        <br />
                        Mukokobi
                      </p>
                      <p className="mt-1.5 whitespace-nowrap text-[0.62rem] font-semibold tracking-[0.14em] text-accent lg:tracking-[0.2em]">
                        FOUNDER & HOST
                      </p>
                    </div>
                  </div>

                  <div
                    className="col-start-1 row-start-1 z-20 m-3 max-w-[12.75rem] justify-self-start self-end animate-fade-up lg:-ml-6 lg:mb-12 lg:max-w-[15.5rem]"
                    style={{ animationDelay: "0.65s" }}
                  >
                    <div className="animate-float-delayed rounded-2xl border border-accent/25 bg-background/90 p-4 shadow-card backdrop-blur-md">
                      <p className="text-sm italic leading-relaxed text-primary">
                        <span className="mr-1 text-2xl leading-none text-accent not-italic">“</span>
                        Every woman's journey is unique, but our strength is universal.
                        <span className="ml-0.5 text-2xl leading-none text-accent not-italic">”</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>

        {/* About Her Namibia — photo stays fixed while the copy scrolls over it */}
        <section id="about" className="relative scroll-mt-24">
          <div className="sticky top-0 z-0 h-svh overflow-hidden">
            <img
              src="/images/priscilla-2.jpeg"
              alt="Pricilla Mukokobi"
              className="absolute inset-0 h-full w-full object-cover object-[22%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-primary/45 via-primary/10 to-transparent" />
          </div>

          <div className="relative z-10 -mt-[100svh]">
            <div className="flex min-h-svh items-center px-5 py-28 lg:justify-end lg:px-16">
              <div className="w-full max-w-xl rounded-3xl border border-background/40 bg-background/90 p-6 shadow-lift backdrop-blur-md sm:p-10 lg:max-w-lg xl:max-w-xl">
                <span className="text-xs font-bold tracking-[0.2em] text-accent">ABOUT HER NAMIBIA</span>
                <h2 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
                  Every Woman Has a Story Worth Hearing
                </h2>
                <p className="mt-5 text-muted-foreground">
                  Her Namibia is a platform that celebrates the stories of women in Namibia.
                  We share conversations with women from different backgrounds, giving them the
                  opportunity to tell their stories in their own words.
                </p>
                <p className="mt-4 text-muted-foreground">
                  We believe every journey matters and that the experiences of women can inspire,
                  educate and encourage others. From business and leadership to motherhood, health,
                  education, the arts and community work, Her Namibia highlights the women making
                  a difference every day.
                </p>
              </div>
            </div>

            <div className="flex px-5 lg:justify-end lg:px-16">
            <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2 lg:max-w-2xl">
              <div className="rounded-3xl border border-background/30 bg-background/88 p-6 shadow-lift backdrop-blur-md sm:p-8">
                <h3 className="text-lg font-bold text-primary">Our Vision</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  To become a leading platform where women's voices are heard, their stories
                  are preserved, and their experiences inspire future generations across Africa and beyond.
                </p>
              </div>
              <div className="rounded-3xl border border-background/30 bg-background/88 p-6 shadow-lift backdrop-blur-md sm:p-8">
                <h3 className="text-lg font-bold text-primary">Our Mission</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  To share honest, meaningful conversations with women from all walks of life,
                  highlighting their journeys, challenges, achievements, and lessons to inspire positive change.
                </p>
              </div>
            </div>
            </div>
            <div className="h-[70svh]" aria-hidden />
          </div>
        </section>

        {/* Featured Stories */}
        <section id="stories" className="scroll-mt-24 bg-surface py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-bold tracking-[0.2em] text-accent">
                FEATURED STORIES
              </span>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Stories That Inspire</h2>
              <p className="mt-4 text-muted-foreground">
                Discover the incredible journeys of women across Namibia, each with their unique 
                story of resilience, achievement, and inspiration.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED_STORIES.map((story, i) => (
                <Reveal key={story.title} delay={i * 80}>
                  <div className="hover-lift relative flex h-full min-h-60 flex-col overflow-hidden rounded-xl border-2 border-primary shadow-card">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${story.image})` }}
                      aria-hidden
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/30 to-primary/20" aria-hidden />
                    <div className="relative p-7">
                      <h3 className="text-2xl font-bold leading-tight text-primary-foreground drop-shadow-md sm:text-3xl">{story.title}</h3>
                      <p className="mt-3 text-base leading-relaxed text-primary-foreground drop-shadow-md sm:text-lg">
                        {story.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Woman of the Month */}
        <section id="woman-of-month" className="scroll-mt-24 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center mb-12">
              <span className="text-xs font-bold tracking-[0.2em] text-accent">
                WOMAN OF THE MONTH
              </span>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Featured Story</h2>
            </Reveal>

            <div className="bg-primary rounded-2xl p-5 text-primary-foreground sm:p-8 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <Reveal>
                  <div className="relative">
                    <img
                      src={WOMAN_OF_MONTH.image}
                      alt={WOMAN_OF_MONTH.name}
                      className="h-64 w-full rounded-xl object-cover shadow-lift sm:h-96 lg:h-auto"
                    />
                  </div>
                </Reveal>
                
                <Reveal delay={150}>
                  <div>
                    <h3 className="text-2xl font-bold text-accent lg:text-3xl">
                      {WOMAN_OF_MONTH.name}
                    </h3>
                    <p className="mt-2 text-lg font-semibold opacity-90">
                      {WOMAN_OF_MONTH.title}
                    </p>
                    
                    <p className="mt-6 text-primary-foreground/90 leading-relaxed">
                      {WOMAN_OF_MONTH.story}
                    </p>
                    
                    <div className="mt-6">
                      <h4 className="font-bold text-accent">Achievements:</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {WOMAN_OF_MONTH.achievements.map((achievement) => (
                          <span
                            key={achievement}
                            className="rounded-full bg-accent/20 px-3 py-1 text-sm font-semibold text-accent"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <RecentNews />
        <RecentWork />
        <RecentPodcasts />
        <RecentResources />
      </main>
      <Footer />
    </div>
  );
}