# 09 — Quick add on catalogue listing

**What to build:** A quick "Add" action on each catalogue card so a shopper can drop a product into the cart straight from the listing, opening the same cart sheet as the detail page.

**Blocked by:** 08 — Cart sheet on add-to-cart.

**Status:** ready-for-agent

- [ ] Each product card on the listing has a quick "Add" action; clicking it adds the default (cheapest) variant and opens the cart sheet
- [ ] Clicking "Add" does not trigger the card's navigation to the product detail page
- [ ] Cards whose default variant is out of stock show the action disabled (or "Out of stock")
- [ ] Guests clicking the quick add are redirected to login, matching detail-page behaviour
- [ ] Tests: quick add adds default variant and opens sheet, navigation suppression, out-of-stock disabled, guest redirect