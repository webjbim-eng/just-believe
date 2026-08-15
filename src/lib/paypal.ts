/**
 * Classic hosted PayPal donate button — deliberately not the PayPal REST
 * API (Orders/Checkout SDK), which needs a Client ID + Secret from a
 * PayPal Developer app. Only a business email was provided, which is
 * exactly what this older, still-fully-supported flow needs: a plain GET
 * redirect to PayPal's own hosted payment page, no server call, no
 * credentials, nothing to verify on our end. The tradeoff is real and
 * worth stating plainly: there's no callback we can trust, so a PayPal
 * gift never becomes a Donations row the way a Paystack/Stripe one does
 * — PayPal itself emails the donor (and the business inbox) a receipt,
 * but this app has no record of it. See Tenants.ts's paypal group comment
 * and docs/02-architecture.md §6.
 */
export function buildPayPalDonateUrl(args: {
  businessEmail: string
  amount: number
  currency: 'USD'
  itemName: string
  returnUrl: string
  cancelUrl: string
}): string {
  const params = new URLSearchParams({
    cmd: '_donations',
    business: args.businessEmail,
    item_name: args.itemName,
    amount: args.amount.toFixed(2),
    currency_code: args.currency,
    no_shipping: '1',
    return: args.returnUrl,
    cancel_return: args.cancelUrl,
  })
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`
}
