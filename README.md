Dekko is git for investment portfolios.

It provides a collection of graph algorithms and statistical tools that make it easier to understand how a group of assets collectively behaves.

The intention is to make it very easy to add or remove investments from a portfolio based on their own attributes, as well as the relationships they have to other portfolio holdings.

`Dekko` uses a `git`-style workflow from the command line. You interact with `Dekko` using syntax that follows this convention `dk someCommandName --commandOption1 --commandOption2`.

Example use case:
_As an investor, you're contemplating a collection of N stocks. You want to eliminate the most highly-correlated assets until only M remain. And of these, you may want to consider the subset with closing prices between $15 and $20. From there, you many want to add or remove specific stocks on an ad-hoc basis, and calculate time-series statistics._

Dekko makes this type of analysis easy and reproducible.
