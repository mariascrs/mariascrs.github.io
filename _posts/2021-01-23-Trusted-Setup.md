---
layout: article
title: Trusted Setup with Isogenies
tags: maths isogeny cryptography post-quantum  
mathjax: true
aside:
  toc: true
---

Trusted parties are fundamental in setting up secure communication among parties. For instance, a trusted setup is needed when establishing a trusted relationship between users and certain public information in a public-key infrastructure (PKI) for public-key encryption and signature schemes. 

The risk with placing trust on a third party can be seen when they misbehave, causing the security of the scheme to be compromised. For example, if the trusted certificate authority of a PKI is corrupted and issues certificates for users without verifying their identities, there is no longer a guarantee on the privacy and authenticity of the communication. 

## Supersingular Isogeny Graph

Before discussing trusted setups in isogeny-based cryptography, we will take a slight detour and talk about the supersingular isogeny graph. For a more in depth discussion on isogenies for cryptography see my previous blogpost [here](https://mariascrs.github.io/2020/11/06/isogenies-for-crypto.html). 

Let $p$ be prime and consider supersingular elliptic curves defined over $\mathbb{F}\_{p^2}$ (up to $\mathbb{F}\_{p^2}$-isomorphism). For any prime $l \neq p$, we can construct an $l$-isogeny graph, where:

* each vertex is associated to the $j$-invariant of a supersingular elliptic curve. We note that supersingular curves have the same $j$-invariant **if and only if** they are $\mathbb{F}\_{p^2}$-isomorphic. Therefore, each vertex actually represents all $\mathbb{F}\_{p^2}$-isomorphic supersingular curves with this $j$-invariant.
* we have an edge between two vertices $j, j'$ if there is a degree $l$ isogeny $\phi: E \rightarrow E'$ where $E, E'$ have corresponding invariants $j, j'$. 

We note that due to the existence of a dual isogeny $\hat{\phi}: E' \rightarrow E$, the graph is undirected. This graph has a variety of properties that make it good for use in cryptography:

* we can walk efficiently on these graphs;
* the graph has fast mixing, which intuitively means that there is a *short* path to *almost* all nodes;
* given the end point of a path on the graph, there is no classical or quantum efficient algorithm to recover this path;
* we can navigate the graphs as they have enough structure.

In fact, letting $p = l_A^{e_A}l_B^{e_B}\cdot f \pm 1$ as in my [previous blogpost](https://mariascrs.github.io/2020/12/04/sidh.html) on SIDH, this key exchange can be rephrased as Alice and Bob constructing paths from $e_A$ and $e_B$ edges on the supersingular $l_A$- and $l_B$-isogeny graph, respectively.

If this seems very abstract, click [here](https://isogenies.enricflorit.com/visualizations/index.html) to see some wonderful visualisations of this graph and how it's used in the SIDH key exchange, created by Enric Florit and Gerard Finol. 

## The Need for a Trusted Setup

In many isogeny-based protocols, the setup involves generating a supersingular elliptic curve whose endomorphism ring is unknown. Currently, the only way this can be done is by using a trusted third party that performs a random walk on the isogeny graph from a base curve and then forgets it. 

The need for this trusted setup has been highlighted by the following two constructions:

*  De Feo, Masson, Petit and Sanso's Verifiable Delay Function from supersingular isogenies and pairings in [^1].

* A new primitive called 'Delay Encryption' introduced by Burdges and De Feo in [^2].

Though this is not ideal we must note that protocols with trusted setups have seen practical applications. Indeed, Ethereum is considering standardizing the verifiable delay function based on RSA, which needs a trusted setup. 

### Removing Trusted Setup 

Removing the trusted setup in isogeny-based cryptography schemes is an active area of research and is achieved by finding a way to 'hash' into a supersingular isogeny graph without revealing a path to a known base curve. This later condition is needed as it has been shown that knowing the path on the isogeny graph allows us to compute the endomorphism ring of the supersingular elliptic curve in polynomial time [^3] [^4].

Charles, Goren and Lauter (CGL) introduced a hash function [^5] that can be used to hash any string into the supersingular isogeny graph. However, by contruction, this hash function leaks the isogeny path from a base elliptic curve and so cannot be used to remove the trusted setup.

Besides the CGL approach, an efficient algorithm used to construct elliptic curves for cryptographic schemes is the complex-multiplication (CM) method (see for example [this website](https://crypto.stanford.edu/pbc/notes/ep/cm.html)). It is natural to ask whether this can instead be used to hash into the supersingular isogeny graph. In 'Rational Isogenies from Irrational Endomorphisms', however, Castryck, Panny and Vercauteren show it can't by proving curves constructed using the CM method can be located in the graph in a "suprisingly explicit manner" [^6]. In addition, Love and Boneh proved that another class of supersingular elliptic curves, which they call '$M$-small', cannot be used to construct such a hash function [^7].

## Conclusion 

Currently, finding a way to hash into the supersingular isogeny graph without leaking the path taken is an open problem and so trusted setups are still needed. There is currently no reason to believe that removing this trusted setup is not possible, but one thing is certain: any advances in this area of research would be pivotal and allow many interesting schemes to be built from isogeny-based cryptography.

## References and Further Reading

[^1]: Luca De Feo, Simon Masson, Christophe Petit and Antonio Sanso. "Verifiable delay functions from supersingular isogenies and pairings." In International Conference on the Theory and Application of Cryptology and Information Security, pp. 248-277. Springer, Cham, 2019.

[^2]: Jeffrey Burdges and Luca De Feo. "Delay encryption." Cryptology ePrint Archive, Report 2020/638, 2020. https://eprint. iacr. org/2020/638.

[^3]: David Kohel, Kristin Lauter, Christophe Petit, and Jean-Pierre Tignol. "On the quaternion $\ell$-isogeny path problem." LMS Journal of Computation and Mathematics 17, no. A (2014): 418-432.

[^4]: Kirsten Eisenträger, Sean Hallgren, Kristin Lauter, Travis Morrison and Christophe Petit. "Supersingular isogeny graphs and endomorphism rings: reductions and solutions." In Annual International Conference on the Theory and Applications of Cryptographic Techniques, pp. 329-368. Springer, Cham, 2018.

[^5]: Denis X. Charles, Kristin E. Lauter and Eyal Z. Goren. "Cryptographic hash functions from expander graphs." Journal of CRYPTOLOGY 22, no. 1 (2009): 93-113.

[^6]: Wouter Castryck, Lorenz Panny, and Frederik Vercauteren. "Rational isogenies from irrational endomorphisms." In Annual International Conference on the Theory and Applications of Cryptographic Techniques, pp. 523-548. Springer, Cham, 2020.

[^7]: Jonathan Love and Dan Boneh. "Supersingular curves with small noninteger endomorphisms." Open Book Series 4, no. 1 (2020): 7-22.
