import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
}

function setMetaTag(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (el) {
    el.setAttribute("content", content);
  } else {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    el.setAttribute("content", content);
    document.head.appendChild(el);
  }
}

const SEO = ({ title, description, canonical }: SEOProps) => {
  useEffect(() => {
    document.title = `${title} | AppRival`;

    setMetaTag("name", "description", description);
    setMetaTag("property", "og:title", `${title} | AppRival`);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", "website");

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (link) {
        link.href = canonical;
      } else {
        link = document.createElement("link");
        link.rel = "canonical";
        link.href = canonical;
        document.head.appendChild(link);
      }
    }
  }, [title, description, canonical]);

  return null;
};

export default SEO;
