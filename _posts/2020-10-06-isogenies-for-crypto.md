---
layout: article
title: Isogenies for Cryptography
mathjax: true
aside:
  toc: true
---

On July 22, 2020, the [Round 3 NIST finalists](https://csrc.nist.gov/projects/post-quantum-cryptography/round-3-submissions) for their Post-quantum Cryptograph Standardization effort were announced. One of the alternate candidates for public-key encryption and key-establishement algorithms is **SIKE**, a key encapsulation mechanism (KEM) based on *isogenies*. A non-specialist wanting a basic understanding of the schemes may find that SIKE protocol has one of the highest barriers of entry due to the sheer amount of mathematical background you need to understand before getting to the cryptography part. This post is aimed at providing a *hopefully* short introduction to isogenies and other related concepts. In a future post I'll apply this to cryptography and indroduce SIDH (the key exchange protocol that SIKE is based on). 

Assumed knowledge:
* Elliptic Curves (over Finite Fields)  
    * What they are
    * How they form a group under addition of point
* *A little bit of* group theory
* Basic properties of functions like surjectivity, injectivity, bijectivity etc. 

## Isogenies

Let $E_1$ and $E_2$ be elliptic curves defined over a finite field $\mathbb{F}_q$. Here, $q$ is some prime power. We note that $E_1$ and $E_2$ form groups under the addition of points and as $\mathbb{F}_q$ is finite, so are these groups. 

**Note:** Normally in maths papers, to specify the field $K$ which the elliptic curve is defined over, we write $E_i(K)$. I'll drop this notation because we will only be considering the elliptic curves over a finite field.  

Say we now want to consider map between these two elliptic curves:

$$ 
\phi: E_1 \longrightarrow E_2 
$$

But wait, what do we even mean by a map from one elliptic curve to another? We might also wonder what properties should this map have for it to 'behave well' in both the geometric and algebraic sense? 

* $\phi$ acts on points on the elliptic curve, which have an $x$ and a $y$ coordinate. So we can write $\phi = (\phi_1, \phi_2)$, which acts on a point $P = (x, y)$ on $E_1$ in the following way:

$$
\phi(P) = \phi((x, y)) = (\phi_1(x), \phi_2(y))
$$

* We want this map to be *rational*. By this we mean that if $\phi = (\phi_1, \phi_2)$, then $\phi_1$ and $\phi_2$ are just algebraic fractions where the denominator and numerator are polynomials. For example

$$
\frac{x^3+4x+1}{2x+5}
$$

* We want $\phi$ to have this property, because it is a well known fact in maths that a rational map is either **surjective or constant**. Though this may not seem important, once we define a few more properties and start looking at isogenies, this becomes really useful. 

* As $E_1$ and $E_2$ form groups, ideally we would like $\phi$ to be a group homomorphism. Intuitively this means thats $\phi$ will preserve the group structure. Mathematically, if $+_i$ is the group operation on $E_i$ (namely, the addition of points on $E_i$), and $P, Q$ are two points on $E_1$ then

$$
\phi(P +_1 Q) = \phi(P) +_2 \phi(Q)
$$

If we label the identity of the group $E_i$ as $\mathcal{O}_i$ we can make the following definition. 

**Definition:** A rational map $\phi: E_1 \longrightarrow E_2$ is called an *isogeny* if $\phi(\mathcal{O}_1) = \mathcal{O}_2$.

It turns out that a map being *rational* and *sending the identity to itself* automatically makes the isogeny a **group homomorphism**! 

Also, the isogeny is either the identity map (it is a constant map that sends the identity to itself) OR it must be surjective. 

A really famous example of an isogeny when we're working over a finite field $\mathbb{F_q}$ is the **Frobenius Map**. If $P = (x, y)$, this map is given by 

$$
\phi(P) = (x^q, y^q)
$$

It's an easy check to see that this is in fact an isogeny so I encourage you to try show this to make sure you understand the definition!

There are various properties of isogenies that will be important to us. 

## Endomorphisms

**Definition:** If $E_1 = E_2$ then $\phi$ is called an *endomorphism*. 

**Definition**: $\phi$ is an *isomorphism* if it is bijective. Remember that  $\phi$ is either the identity or surjective, so we only need to check if $\phi$ is injective.

These endomorphisms are really cool because the set of endomorphisms of an elliptic curve $E$ together with the zero map actually forms a *ring* under the operations of pointwise addition and multiplication. Intuitively, being a ring means that the addition and multiplication behave nicely and interact well with each other. More precisely, a ring means that: 
* it is a group under the addition
* the mulitplication is   associative and has an identity
* multiplication is distributive with respect to addition 

We denote this ring by $End(E)$.


### j-Invariants

For our purposes, we let $p \equiv 3 \mod 4$ be a prime and we consider the finite field to be $\mathbb{F}_{p^2} = \mathbb{F}(i)$, where $i^2 + 1 = 0$ and so the elements in this finite field are of the form $u + iv$ where $u, v \in \mathbb{F}_p$. Unless stated otherwise, we now assume all elliptic curves are over this finite field.

Instead of considering each individual elliptic curve, what we actually want to do is consider $E_1$ and $E_2$ to be 'equivalent' elliptic curves **if and only if** they are isomorphic. To do this we need some sort of invariant that will be the same for $E_1$ and $E_2$ **if and only if** they are isomorphic. So, we introduce the **$j$-Invariant**! 

Writing the elliptic curve $E$ $\mathbb{F}_{p^2}) in *Weierstrauss Form**, namely 

$$
y^2 = x^3 +ax^2 +bx + c
$$

where $a, b, c \in \mathbb{F}_{p^2}$ we have

$$
j(E) = 1728 \frac{4a^3}{4a^3 + 27b^2}
$$

We have that, over $\mathbb{F}_{p^2}$, two elliptic curves are isomorphic **if and only if** they have the same $j$-invaraint, which is exactly the property we were looking for!

## Properties of Isogenies 

### Seperable vs. Inseperable 

A word that is used a lot in papers on isogeny cryptography is *seperable*. In general, an isogeny can be either *seperable* or *inseperable*. The definitions aren't really that important, but for the maths to work out and be nice, we want the isogenies to be *seperable*. 

The most important thing about seperable isogenies is that fact that they are in one-to-one correspondence with finite subgroups. *What does this mean?* Basically, every subgroup $G$ of the points on an elliptic curve $E_1$ gives rise to a unique isogeny $\phi: E_1 \longrightarrow E_2$ whose kernel is $G$ (recall that a kernel of $\phi$ is the set of points in $E$ that get mapped to the identity $\mathcal{O}_1$), and vice versa. If this is the case, the codomain is sometimes written as $E_1/G$ rather than $E_2$. 

This is made explicit by Velu's formulas: given an elliptic curve $E_1: y^2 = x^3 +ax^2 +bx + c$,  these formulas output an elliptic curve $E_2 = E_1/G$ and the explicit maps for $\phi$. In a furture blog post I will go into more detail on these formulas. 

### Degree

**Definition:** The *degree* of a non-zero sepearable isogeny is the number of elements in the kernel. Equivalently, though less importantly, it is the degree of the isogeny as a rational map (if you want a precise definition of what this means see page 21 Silverman's 'Arithmetic of Elliptic Curves').

We can view isomorphisms as being special isogenies whose kernel is just $\{\mathcal{O}\}$ i.e. an isogeny of degree 1. 

Degree interacts really nicely with composition of isogenies in the sense that 

$$
\deg(\phi \circ \psi) = \deg(\phi) \times \deg(\psi)
$$

## Dual Isogenies 

We know that isomorphisms have an inverse and that composing them together gives us the identity map. But what about isogenies? Is there an analogue?

In general, isogenies doe not have an inverse, however every isogeny $\phi$ has a unique *dual* isogeny, which we denote as $\hat{\phi}$. Rather than composing to give the identity, if 

$$
\phi: E_1 \longrightarrow E_2
$$

is an isogeny of degree $d$, then the composition gives us 

$$
\phi \circ \hat{\phi} = [d], 
$$

where $[d]: E_1 \longrightarrow E_2$ is the multiplication by $d$ map.

## References

[1] **Supersingular Isogeny Key Exchange for Beginners**, by Craig Costello (https://eprint.iacr.org/2019/1321.pdf)

[2] **Arithmetic of Elliptic Curves**, by Joseph H. Silverman
