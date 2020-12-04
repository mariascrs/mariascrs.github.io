---
layout: article
title: Vélu's Formulas for SIDH
tags: maths elliptic curve cryptography post-quantum
mathjax: true
aside:
  toc: true
---
In this blog post I will assume knowledge on:
* Elliptic curves (over finite fields)
* A [previous blogpost](https://mariascrs.github.io/2020/10/06/isogenies-for-crypto.html) on isogenies for cryptography
* Polynomials

Suppose we have an  elliptic curve $E_1$ over a finite field $\mathbb{F}_{p^2}$. Given the kernel of an isogeny (a finite subgroup of the group of points on $E_1$), Vélu's formulas give us a way to determine the codomain of the isogeny, as well as compute the isogeny. This technique is used in the Supersingular Isogeny Diffie-Hellman (SIDH) protocol proposed by Feo, Jao and Plût [2], which I will introduce in a future blog post.  

## Weierstrass Form

The input of Vélu's formulas is an elliptic curve $E_1$ in general Weierstrass form and a finite subgroup of the group of points on $E_1$, let's call it $G$. 

A curve $E_1$ is said to be in general Weierstrass form over $\mathbb{F}_{p^2}$ if

$$
E_1: y^2 + axy + by = x^3 + cx^2 + dx + e
$$

where $a, b, c, d, e \in \mathbb{F}\_{p^2}$ and the discriminant (a polynomial in $a, b, c, d, e$) is non-zero. This second condition ensures that the ellitpic curve is non-singular, which geometrically means the curve has no cusps or self-intersections.

When we consider the SIDH protocol, we will use elliptic curves in Montgomery form, namely

$$
by^2 = x^3 + ax^2 + x
$$

which is isomorphic to a curve in Weierstrass form over $\mathbb{F}\_{p^2}$, via the isomorphism

$$
\phi(x, y) = (\frac{x}{b}, \frac{y}{b^2})
$$

Don't worry about the details of the isomorphism as it won't be necessary for the SIDH protocol.

Remembering that what we are interested in for cryptography is the *isomorphism class* of the elliptic curves, the main takeaway is that for the SIDH protocol we will use elliptic curves in a form that will allow us to use Vélu's formulas. 

## Vélu's Formulas
I will now explain the steps proposed by Vélu to compute the isogeny and codomain, given

$$
E_1: y^2 + axy + by = x^3 + cx^2 + dx + e
$$ 

and a finite set of points $G$.

For those not interested in implementing these formulas, the details are not that important. However, it is worth noting that these formulas are just rational functions of the inputs mentioned above, and the degrees of these functions are the same size as the size of $G$. Therefore, they are quite *nice* and *easy to implement*. Without these formulas it would be hard to implement any cryptography scheme based on isogenies.  

### Step 1
Partition the set of points $G$

1. Discard the identity point $\mathcal{O}$

2. Let $G_2$ be all the 2-torsion points and let $R$ be the rest of the points in $G$

3. Split $R$ into two equal sized sets, which we will call $R_+$ and $R_-$, such that if $P \in R_+$ then $-P \in R_-$.

4. Let $S$ be the union $R_+ \cup G_2$.

### Step 2
Now given $Q = (x_Q, y_Q) \in S$ we define the following quatities 

* $f_Q = 3x^2_Q + 2cx_Q + d - ay_Q$
* $g_Q = -2y_Q - ax_Q - b$

If $Q$ is a 2-torsion point (i.e. in $G_2$), then let 

$$
v_Q = f_Q
$$

Otherwise, let

$$
v_Q = 2f_Q - ag_Q
$$

Then let $u_Q = (g_Q)^2$. Finally we compute

$$
v = \sum_{Q \in S} v_Q, \text{    } w = \sum_{Q \in S} (u_Q + x_Qv_Q)
$$

### Step 3

We can now compute the target image. 

Define the following values:

* $A = a$
* $B = b$
* $C = c$
* $D = d - 5v$
* $E = e - (a^2 + 4c)v - 7w$

Then the Weierstrass quation for the codomain of the isogeny is

$$
E_2: y^2 + Axy + By = x^3 + Cx^2 + Dx + E
$$

### Step 4

The image point of the point $(x, y)$ under the isogeny is given by $(\alpha, \beta)$ where

$$
\alpha = x+ \sum_{Q \in S} (\frac{v_Q}{x - x_Q} - \frac{u_Q}{(x - x_Q)^2})
$$

and

$$
\beta = y - \sum_{Q \in S} (u_Q \frac{2y+ax + b}{(x - x_Q)^3} + v_Q\frac{a_1(x - x_Q) + y - y_Q}{(x - x_Q)^2}+ \frac{au_q - f_Qg_Q}{(x - x_Q)^2})
$$

For the proof of the correctness of these formulas, see Washington's treatment in [23].

## Concluding Thoughts

Though the details of these formulas are not that important, it helps us bridge the gap between theory and implementation. In theory, a cryptographic scheme based on isogenies can be found to be secure and sound, but if it cannot be implemented then it is of little practical use. 





## Further Reading

[1] **Isogenies of Elliptic Curves: A Computational Approach**, by Daniel Shumow.

[2] **Towards Quantum-Resistant Cryptosystems from Supersingular Elliptic Curve Isogenies**, by Luca de Feo, David Jao and Jérôme Plût.

[3] **Elliptic curves: Number theory and cryptography**, by Lawrence Washington.
