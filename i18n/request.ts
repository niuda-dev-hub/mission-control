import { getRequestConfig } from 'next-intl/server';
import { locales } from './routing';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as (typeof locales)[number])) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
