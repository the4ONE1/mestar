import { useEffect } from "react";

/**
 * Analytics loader — injects GA4, GTM, and Meta Pixel snippets client-side
 * only when their env vars are present. Set any of these in your project
 * to enable them; leave unset to disable (no snippet is loaded):
 *   - VITE_GA_ID         (e.g. G-XXXXXXXXXX)
 *   - VITE_GTM_ID        (e.g. GTM-XXXXXXX)
 *   - VITE_META_PIXEL_ID (numeric pixel id)
 */

const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;
const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

function loadScript(src: string, id: string, async = true) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = async;
  s.src = src;
  document.head.appendChild(s);
}

function inlineScript(id: string, code: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.text = code;
  document.head.appendChild(s);
}

export const Analytics = () => {
  useEffect(() => {
    // Google Analytics 4
    if (GA_ID && GA_ID.startsWith("G-")) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, "ga4-src");
      inlineScript(
        "ga4-init",
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`
      );
    }

    // Google Tag Manager
    if (GTM_ID && GTM_ID.startsWith("GTM-")) {
      inlineScript(
        "gtm-init",
        `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`
      );
    }

    // Meta (Facebook) Pixel
    if (META_PIXEL_ID && /^\d+$/.test(META_PIXEL_ID)) {
      inlineScript(
        "meta-pixel-init",
        `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`
      );
    }
  }, []);

  return null;
};

export default Analytics;
