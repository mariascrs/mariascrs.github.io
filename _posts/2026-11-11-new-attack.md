---
layout: article
title: An improved algorithm to solve the isogeny problem in dimension 2 with precomputation
tags: isogeny cryptography post-quantum dimension-2 paper
mathjax: true
aside:
  toc: true
paper: https://eprint.iacr.org/2026/2808
---

In this blogpost, I'll give an overview of my new paper *An improved algorithm to solve the isogeny problem in dimension 2 with precomputation* ([link](https://eprint.iacr.org/2026/2808)).

The isogeny problem for supersingular elliptic curves underlies the security of (almost) all of isogeny-based cryptography. The growing interest in higher-dimensional isogeny-based cryptography has brought with it interest in the higher-dimensional isogeny problem, and in this blogpost we focus on dimension 2.

The objective of this blogpost is to describe the main ideas of the paper. The proofs require some technical objects (such as Kani's refined Humbert invariant), but the ideas themselves are quite natural. In this post, we'll take a tour of the various algorithms for solving the isogeny problem in dimension 2: the Costello–Smith algorithm and its recent rigorous variant, SplitSearcher, and finally the new algorithm. 


TL;DR: after a one-time precomputation that depends only on $p$, the new algorithm solves the superspecial isogeny problem in dimension 2 in time and memory $p^{3/4+o(1)}$ per instance. Including the precomputation, a single instance takes time $p^{19/23+o(1)}$. Both improve on the $p^{1+o(1)}$ of the Costello–Smith algorithm, and our analysis is unconditional.

It is also worth comparing this to the recent work of Houben and Pham [^HP26], who give an algorithm for the *one endomorphism problem* in dimension 2: given a superspecial principally polarised abelian surface over $\mathbb{F}\_{p^2}$ with $p \equiv 3 \pmod 4$, it computes a non-scalar polarised endomorphism in expected time and memory $p^{4/5+o(1)}$, under a heuristic on the smoothness of the multiplier of a short endomorphism. Unlike in dimension 1, where the one endomorphism, endomorphism ring and isogeny problems are known to be equivalent, the corresponding reductions in dimension 2 are not fully established. To solve the isogeny problem, they therefore need a second heuristic (on the distribution of the endomorphisms their algorithm outputs), and additionally assume GRH. By contrast, we directly target the isogeny problem, and our analysis is unconditional. For a single instance (including the precomputation), our algorithm is slightly slower than theirs ($p^{0.826}$ versus $p^{0.8}$), but it uses less memory. However, since our precomputation depends only on $p$, it can be reused for every instance over the same prime, as happens whenever a cryptographic scheme fixes its parameters. In this setting, each instance is solved in time and memory $p^{3/4+o(1)}$, outperforming the algorithm of Houben and Pham per instance.

# The problem

Let's start in dimension 1. Let $p$ be a large prime. There are roughly $p/12$ supersingular elliptic curves over $\bar{\mathbb{F}}\_p$ up to isomorphism, and they can all be defined over $\mathbb{F}\_{p^2}$. For a prime $\ell \neq p$, we can define the corresponding supersingular $\ell$-isogeny graph: the vertices are supersingular elliptic curves (up to isomorphism) and the edges are $\ell$-isogenies. The graph is $(\ell+1)$-regular (up to some small complications at $j = 0, 1728$), connected, and Ramanujan [^Piz90], i.e., it has optimal expansion. 

> The *supersingular isogeny problem* asks: given two supersingular elliptic curves $E\_1$ and $E\_2$ over $\mathbb{F}\_{p^2}$, find an isogeny $E\_1 \rightarrow E\_2$. 

This can be viewed instead as a path finding problem between two vertices of the supersingular isogeny graph. The best known classical algorithm for this problem is due to Wesolowski [^Wes26], and runs in time and memory $p^{1/3+o(1)}$ under a smoothness heuristic, improving on the earlier $\tilde{O}(\sqrt{p})$ algorithm due to Delfs and Galbraith [^DG16].

To move to dimension $g > 1$, we generalise the objects as follows. Elliptic curves become *principally polarised abelian varieties* (p.p.a.v.). A principal polarisation of an abelian variety $A$ is an isomorphism $\lambda\colon A \xrightarrow{\sim} A^\vee$ to the dual variety (arising from an ample divisor). Though this may seem abstract, the principal polarisation is what allows us to work with our abelian varieties concretely: it allows us to construct an embedding of $A$ into projective space, giving *equations* that describe our abelian varieties. 

For the purposes of this blogpost, however, we can mostly ignore the data of the principal polarisation. In dimension $2$, we work with p.p. abelian *surfaces*, of which there are only two types: 
* products of elliptic curves $E\_1 \times E\_2$;
* Jacobians $\mathrm{Jac}(C)$ of genus 2 curves $C$.

Both have a 'canonical' principal polarisation. 

The notion of supersingularity generalises to *superspeciality* in higher dimension (see the [SplitSearcher blogpost](https://www.mariascrs.com/2023/01/09/splitsearcher.html) for why superspecial, rather than supersingular, is the right notion). Superspecial abelian surfaces are those that are isomorphic to a product $E\_1 \times E\_2$ of supersingular elliptic curves *as abelian surfaces*, but not necessarily as principally polarised surfaces. In particular, Jacobians can be superspecial! There are roughly $p^3/2880$ superspecial principally polarised surfaces up to isomorphism, and again they can all be defined over $\mathbb{F}\_{p^2}$ [^IK94].

We now need to generalise the maps between these objects: $\ell$-isogenies become $(\ell,\ell)$-isogenies. Let me describe these a little more. Let $A$ be a principally polarised abelian surface, and let $N$ be an integer coprime to $p$. Then $A[N] \cong (\mathbb{Z}/N\mathbb{Z})^4$, and the principal polarisation gives the $N$-Weil pairing $e\_N\colon A[N] \times A[N] \rightarrow \mu\_N$, a non-degenerate alternating pairing.

> **Definition.** A subgroup $K \subseteq A[N]$ is *isotropic* if $e\_N(P, Q) = 1$ for all $P, Q \in K$, and *maximal isotropic* if it is not contained in a larger isotropic subgroup of $A[N]$. 

Maximal isotropic subgroups are exactly the isogeny kernels that let us stay in the world of principally polarised surfaces, i.e., $A \to A/K$ is a polarised isogeny. If moreover $K \cong (\mathbb{Z}/N\mathbb{Z})^2$, we call $A \rightarrow A/K$ an $(N,N)$-isogeny. When $N = \ell$ is prime, every maximal isotropic subgroup of $A[\ell]$ is of this form, and there are $(\ell+1)(\ell^2+1)$ of them. In general, there are $N^3 \prod\_{\ell \mid N}(1 + \ell^{-1})(1 + \ell^{-2})$ of them, so roughly $N^3$.

We'll mostly be interested in three types of $(N,N)$-isogenies:

* *generic* isogenies $\mathrm{Jac}(C) \rightarrow \mathrm{Jac}(C^\prime)$;
* *splittings* $\mathrm{Jac}(C) \rightarrow E\_1 \times E\_2$;
* *gluings* $E\_1 \times E\_2 \rightarrow \mathrm{Jac}(C)$.


The *superspecial isogeny problem in dimension 2* asks: given two superspecial principally polarised abelian surfaces $A\_1$ and $A\_2$ over $\mathbb{F}\_{p^2}$, find an isogeny $A\_1 \rightarrow A\_2$. As in dimension 1, this can be viewed as a path-finding problem, this time in the superspecial isogeny graph.

<img src="../../../images/posts/dim2-attack/isogeny-graph.png" >

From the discussion above, we can immediately see that the vertex set $\mathrm{SS}\_2(p)$ of the superspecial isogeny graph is the disjoint union of two smaller sets: the set $\mathcal{J}(p)$ of superspecial Jacobians, and the set $\mathcal{E}(p)$ of products of supersingular elliptic curves. There are only about $p^2/288$ products, so they are rare: they make up roughly a $10/p$ fraction of all the vertices.

# The Costello–Smith algorithm

The best known algorithm for the superspecial isogeny problem in dimension 2 was, until now, due to Costello and Smith [^CS20]. It exploits the rare products as follows.

**Step 1.** Starting from $A\_1$, take a random walk in the $(2,2)$-superspecial isogeny graph until landing on a product $E\_1 \times E\_2 \in \mathcal{E}(p)$. Do the same starting from $A\_2$, landing on a product $E\_3 \times E\_4$.

<img src="../../../images/posts/dim2-attack/cs-step1.png" >

**Step 2.** We now have two products of elliptic curves, so we can find isogenies $E\_1 \rightarrow E\_3$ and $E\_2 \rightarrow E\_4$ using a dimension 1 algorithm (Costello and Smith use the Delfs–Galbraith algorithm), and combine them into an isogeny $\pi \colon E\_1 \times E\_2 \rightarrow E\_3 \times E\_4$ (up to a small parity issue, discussed in the [SplitSearcher blogpost](https://www.mariascrs.com/2023/01/09/splitsearcher.html)). Composing everything gives the isogeny $A\_1 \rightarrow A\_2$.

<img src="../../../images/posts/dim2-attack/cs-step2.png" >

**How long does Step 1 take?** Products make up a $\Theta(1/p)$ proportion of the vertices.
Therefore, a walk that visits vertices according to the uniform distribution should land on a product after about $p$ steps. (We remark that a random walk actually converges to the "stationary distribution", but the proportion will still be $\Theta(1/p)$; more on this in the next section).

To turn this argument into a runtime, Costello and Smith *assumed* that, like its dimension 1 counterpart, the superspecial isogeny graph is Ramanujan (i.e., has optimal expansion), so that random walks quickly converge to the uniform distribution. Under this assumption, Step 1 takes $\Theta(p)$ steps, each of which costs polynomial in $\log p$. Step 2 is much cheaper (with Delfs–Galbraith, it costs $\tilde{O}(\sqrt{p})$), so we get:

> **Theorem** (Costello–Smith, heuristic). The isogeny problem in dimension 2 can be solved in time $\tilde{O}(p)$.

From this point onwards, we'll ignore the dimension 1 step and simply focus on the bottleneck step: given a superspecial Jacobian $J$, find a splitting $J \rightarrow E\_1 \times E\_2$.

## Making this algorithm rigorous

It is natural to ask: is the Ramanujan assumption justified? Unfortunately, it isn't. Unlike in dimension 1, the superspecial isogeny graph is *not* Ramanujan [^JZ26]. To make the analysis of Costello and Smith rigorous, we instead need to know that random walks in the superspecial isogeny graph still mix rapidly. Namely that, after a short walk, the endpoint is distributed (almost) according to the stationary distribution of the graph.

The stationary distribution is *essentially* the uniform distribution, except that it is natural to count each surface $A$ with weight $1/\lvert \mathrm{Aut}(A) \rvert$ (its *mass*), where $\mathrm{Aut}(A)$ is the group of automorphisms of $A$ preserving the polarisation. Then, the stationary distribution gives each surface probability proportional to its mass. The total mass of all superspecial surfaces is $(p-1)(p^2+1)/5760$, and products account for a proportion of about $5/p$ of it.

Rapid mixing was recently proved by Aikawa, Tanaka and Yamauchi [^ATY24], and later improved in our paper on rapid mixing in superspecial isogeny graphs [^RM] (joint work with Harun Kır, Olivier Taïbi and Benjamin Wesolowski):

> **Theorem** (rapid mixing). Let $\ell \neq p$ be prime. A random walk of length $O(\log p)$ in the superspecial $(\ell,\ell)$-isogeny graph ends in a set $S$ of superspecial surfaces with probability at least
>
> $$
> \frac{1}{2}\,\frac{\mu(S)}{\mu(\mathrm{SS}_2(p))}
> $$
>
> where $\mu(S) = \sum\_{A \in S} \frac{1}{\lvert \mathrm{Aut}(A) \rvert}$ is the mass of $S$.

For our asymptotic statements, knowing that the length of the walk is $O(\log p)$ is sufficient. However, the constants can also be made precise [^RM].

This gives a heuristic-free version of the bottleneck step of Costello–Smith:

1. take a fresh random walk of length $O(\log p)$ starting at $J$, ending at some $J^\prime$;
2. check whether the endpoint $J^\prime$ is a product; if not, go back to 1.

<img src="../../../images/posts/dim2-attack/walk-product.png" >


Taking $S = \mathcal{E}(p)$, we have that $\frac{\mu(S)}{\mu(\mathrm{SS}\_2(p))} \approx \frac{5}{p}$, so the result above tells us that each walk lands on a product with probability $\Omega(1/p)$. As a result, we need an expected $O(p)$ walks, each costing $p^{o(1)}$. 

Step 2 also has to be handled rigorously, resulting in a time and memory cost of $p^{1/2 + o(1)}$.[^dim1] As promised, I'm ignoring it here; for more details, see the paper! [^RM]

This "walk, then test the endpoint" algorithm is what we will improve upon. The question driving the rest of this post is: **what if we test the endpoint for more than just being a product?**

# Looking one isogeny further: SplitSearcher

Instead of only noticing when we land *on* a product, we could notice when we are *one $(N,N)$-isogeny away* from one, i.e., when the endpoint $J^\prime$ is *$(N,N)$-split*, meaning that there is an $(N,N)$-isogeny $J^\prime \rightarrow E\_1 \times E\_2$. As a superspecial surface has roughly $N^3$ outgoing $(N,N)$-isogenies, a single such test inspects roughly $N^3$ surfaces at once, rather than one.

<img src="../../../images/posts/dim2-attack/split-neighbourhood.png" >

This is the main idea behind SplitSearcher [^CCF22], joint work with Craig Costello and Sam Frengley (see the [earlier blogpost](https://www.mariascrs.com/2023/01/09/splitsearcher.html) for more details). In the language of the previous section, we fix a set $\mathcal{N}$ of integers $N \geq 2$, and:

1. take a random walk of length $O(\log p)$ starting at $J$, ending at some $J^\prime$;
2. test whether $J^\prime$ is $(N,N)$-split for some $N \in \mathcal{N}$;
3. if so, recover a splitting $J^\prime \rightarrow E\_1 \times E\_2$; if not, repeat with fresh randomness.

In the original paper, we tested every surface along the walk, rather than only the endpoints, but phrasing it this way allows us to directly apply the rapid mixing result above.

But **how do we detect an $(N,N)$-splitting**? The naive answer is to simply compute all of the roughly $N^3$ neighbours, but this is costly. Instead, we use Humbert surfaces.

## Humbert surfaces

> **Definition.** A principally polarised abelian surface $A$ is *optimally $(N,N)$-split* if there is an *optimal* $(N,N)$-isogeny $A \rightarrow E\_1 \times E\_2$. 

Optimality simply means that the splitting does not come from a splitting of smaller degree.

The *Humbert surface* $\mathcal{H}\_{N^2}$ (of discriminant $N^2$) is the locus of optimally $(N,N)$-split surfaces. For example, $\mathcal{H}\_1$ is the locus of products $E\_1 \times E\_2$, and detecting an (optimal) $(N,N)$-splitting amounts to testing membership in $\mathcal{H}\_{N^2}$. Humbert surfaces were classically defined by Humbert [^Hum99] over the complex numbers, in terms of the period matrices of abelian surfaces. To make sense of them modulo $p$, we instead use Kani's *refined Humbert invariant* [^Kan94], a quadratic form attached to a principally polarised abelian surface that makes sense in any characteristic and recovers Humbert's surfaces over $\mathbb{C}$.

## Igusa–Clebsch invariants

To work with Humbert surfaces concretely, we need coordinates. We use invariants of genus 2 curves, which generalise the $j$-invariant in dimension 1. For this exposition, let's assume that $p > 5$ to avoid any pathological examples. For us, $p$ will be at least $128$ bits anyway!

> **Definition.** Every genus 2 curve $C$ has a model $y^2 = f(x)$ with $f$ a sextic with distinct roots. The *Igusa–Clebsch invariants* $I\_2, I\_4, I\_6, I\_{10}$ of $C$ are explicit polynomial expressions in the roots of $f$, where the subscript is the *weight* of the invariant.

For instance, for $f$ monic, $I\_{10}$ is the discriminant of $f$, so $I\_{10}(C) \neq 0$. The invariants depend on the choice of model, but only up to rescaling 

$$
(I_2, I_4, I_6, I_{10}) \mapsto (\lambda^2 I_2, \lambda^4 I_4, \lambda^6 I_6, \lambda^{10} I_{10}),
$$

so they define a point $(I\_2 : I\_4 : I\_6 : I\_{10})$ in the weighted projective space $\mathbb{P}(2,4,6,10)$. This point determines the curve up to isomorphism. 

As $I\_{10} \neq 0$ for every Jacobian, we lose nothing by working in the affine chart $I\_{10} = 1$. Concretely, choose $u$ with $u^5 = I\_{10}^{-1}$, and define the *normalised invariants*

$$
(i_1, i_2, i_3) := (u I_2,\, u^2 I_4,\, u^3 I_6).
$$

## Detecting splittings with Kumar's parametrisations

To detect $(N,N)$-splittings, SplitSearcher uses explicit parametrisations of Humbert surfaces due to Kumar.

> **Theorem** (Kumar [^Kum15]). For $N \leq 11$, the Humbert surface $\mathcal{H}\_{N^2}$ is rational: there are explicit maps $\varphi\_{N^2} = (\alpha\_1, \alpha\_2, \alpha\_3)$ from $\mathbb{A}^2$ onto (a dense subset of) $\mathcal{H}\_{N^2} \subseteq \mathbb{A}^3$.

<img src="../../../images/posts/dim2-attack/kumar.png" >

So $\mathrm{Jac}(C)$ is $(N,N)$-split if and only if there are $r\_0, s\_0$ with $\varphi\_{N^2}(r\_0, s\_0) = (i\_1, i\_2, i\_3)$, the normalised invariants of $C$. In SplitSearcher, we test this efficiently using precomputed resultants, without ever computing the $(N,N)$-neighbours themselves.

## How much more of the graph do we see?

The key insight is that there are many more surfaces that are $(N,N)$-split than surfaces that are isomorphic to a product (which is what Costello–Smith detects). More precisely, the proportion of superspecial surfaces (weighted by mass, as above) that lie on $\mathcal{H}\_{N^2}$ is

$$
\Theta\!\left(\frac{N^3}{p}\right),
$$

compared to about $5/p$ for products. 

## The limits of SplitSearcher

In SplitSearcher, we tested whether the endpoint is $(N,N)$-split for a few specially chosen $N \le 11$. As the set of $N$'s is fixed, the density increases by a constant factor, and so we get a constant improvement. This was already significant in practice (speedups between $16.5$ and $116.3$ times for primes of $50$ to $800$ bits), but the algorithm still runs in time $p^{1+o(1)}$.

Kumar's parametrisations exist because, for these $N$, the Humbert surface $\mathcal{H}\_{N^2}$ is rational. This is a genuine obstruction for parametrisations at larger $N$. Indeed, Frengley [^Fre24] showed that $\mathcal{H}\_{N^2}$ is rational only for $N \le 16$ and $N \in \\{18, 20, 24\\}$, and is of general type for $N \ge 22$, $N \ne 24$. So to go to large $N$, we need a different description of $\mathcal{H}\_{N^2}$. We will use an equation rather than a parametrisation.

# The new algorithm

With the previous sections in mind, the idea of the new algorithm is simple. As in the rigorous version of Costello–Smith, we take a random walk of length $O(\log p)$ in the superspecial $(2,2)$-isogeny graph starting at $J$. At its endpoint $J^\prime$, we test whether it lies on $\mathcal{H}\_{N^2}$ for some values of $N$, which are now allowed to grow with $p$. If it does, we compute the splitting; if not, we take a fresh walk and repeat. This raises two questions: how do we describe $\mathcal{H}\_{N^2}$ for large $N$, and how do we make the tests cheap enough?

## From parametrisations to equations

Instead of parametrising $\mathcal{H}\_{N^2}$, we look at its image via the Igusa–Clebsch map, which sends (the isomorphism class of) a genus 2 curve $C$ to its Igusa–Clebsch invariants

$$
[C] \longmapsto \big(I_2(C) : I_4(C) : I_6(C) : I_{10}(C)\big) \in \mathbb{P}(2,4,6,10).
$$

The image (more precisely, its Zariski closure) is a surface in the weighted projective space $\mathbb{P}(2,4,6,10)$, so it is cut out by a single weighted homogeneous polynomial

$$
G_N(I_2, I_4, I_6, I_{10}) = 0.
$$

Unlike a rational parametrisation, such an equation exists for every $N$. 
As $G\_N$ vanishes at $(I\_2, I\_4, I\_6, I\_{10})$ if and only if $G\_N(i\_1, i\_2, i\_3, 1) = 0$, we can instead work with our normalised invariants, and visualise the Humbert surface as follows.

<img src="../../../images/posts/dim2-attack/humbert-surface.png" >

Summarising, to test whether a superspecial Jacobian $\mathrm{Jac}(C)$ is optimally $(N,N)$-split, it suffices to check whether $G\_N(i\_1, i\_2, i\_3, 1) = 0$, where $(i\_1, i\_2, i\_3)$ are its normalised invariants. 

Note that products of elliptic curves are invisible in these coordinates: the Igusa–Clebsch invariants are only defined for Jacobians. As a curve degenerates to a product, its invariants tend to the single point $(1:0:0:0)$, so products need to be detected separately. Thankfully, they can efficiently be detected during the computation of the $(2,2)$-isogenies in the walk (as already done in the Costello–Smith algorithm!).

## Constructing $G\_N$

To describe the Humbert surface, we want to construct the polynomial $G\_N$. The most direct approach is to compute it in characteristic $0$ and reduce it modulo $p$, but this does not scale: $G\_N$ has $O(N^9)$ monomials, and its integer coefficients blow up. Instead, we work modulo $p$ from the start, so that each coefficient is just an element of a finite field, and use interpolation:

1. **Sample points on $\mathcal{H}\_{N^2}$.** Take two random elliptic curves $E\_1$ and $E\_2$ over $\mathbb{F}\_{p^2}$ and glue them along the $N$-torsion (using the "basic construction" described by Frey and Kani [^FK91]). This (usually) gives an optimally $(N,N)$-split Jacobian, and so its Igusa–Clebsch invariants give a point on the image of $\mathcal{H}\_{N^2}$.
2. **Interpolate.** Once we have enough samples, we solve a linear system to recover the coefficients of $G\_N$.

For fixed $N$, this costs $N^{18+o(1)}$ and works for every $N$. It only depends on $p$ and $N$, not on the instance: it is a *precomputation*.

We now have all the ingredients, and we can build the new algorithm in three steps.

## Step 1: a single large $N$

To obtain an asymptotic improvement, we could first try running the test with $G\_N$ for $N = p^{\alpha}$ for some $0 \lt \alpha \lt 1/3$. (We need $\alpha \lt 1/3$ so that $N^3 \lt p$. Otherwise, the proportion of $(N,N)$-split surfaces would exceed $1$, so the estimate cannot hold.)

If we test whether the endpoint of each walk lies on the single Humbert surface $\mathcal{H}\_{N^2}$ (using $G\_N$), the density of the surfaces we detect would also grow with $p$. Precisely, it would be $\Theta(N^3/p) = \Theta(p^{3\alpha - 1})$, so we would need about $p/N^3$ walks. However, constructing and storing $\mathcal{H}\_{N^2}$ would also be expensive: $G\_N$ has $O(N^9) = O(p^{9\alpha})$ coefficients, and interpolating it costs about $N^{18} = p^{18\alpha}$.

Worse than this, the test itself gets more expensive. Evaluating $G\_N$ at a single point costs about $N^9$ operations, while the density only grows like $N^3$. So, testing one surface at a time, using larger $N$ actually makes the algorithm *slower*.

## Step 2: the union of many $\mathcal{H}\_{N^2}$

Instead, we fix a positive integer $D < p$ and look at the union of many $\mathcal{H}\_{N^2}$ for $N \le D$. Concretely, we interpolate $G\_N$ for all $2 \le N \le D$, and then compute their product

$$
g = \prod_{N=2}^{D} G_N.
$$

Testing whether a superspecial Jacobian is optimally $(N,N)$-split for *some* $2 \le N \le D$ then amounts to evaluating $g$ at its normalised invariants.

<img src="../../../images/posts/dim2-attack/humbert-union.png" >

Note that this picture is somewhat misleading. The intersection $\mathcal{H}\_{N^2} \cap \mathcal{H}\_{M^2}$ for $N \neq M$ may be non-empty. However, in the paper we argue that surfaces lying on several Humbert surfaces at once are rare, which allows us to estimate the density of the union to be the sum of the individual densities:

$$
\frac{1}{p}\sum_{N=2}^{D} \Theta(N^3) = \Theta\!\left(\frac{D^4}{p}\right).
$$

More precisely, the paper shows that the proportion is at least $D^4/(4p)$ whenever $200D^7 \le p$, so (by rapid mixing) each walk endpoint lies on the union with probability at least $D^4/(8p)$. As the density of the union grows like $D^4$ rather than $N^3$, we can get the same density as a single $N$ for a smaller $D$ (namely $D \approx N^{3/4}$). Computing the image polynomials $G\_2, \dots, G\_D$ is therefore less expensive than computing a single $G\_N$.

The algorithm looks as follows: take a walk, and test whether its endpoint lies in the union $\mathcal{H}\_1 \cup \mathcal{H}\_4 \cup \dots \cup \mathcal{H}\_{D^2}$ (including $\mathcal{H}\_1$, so that we also detect products). If not, repeat.

<img src="../../../images/posts/dim2-attack/single-walk.png" >

The cost of one such evaluation is roughly the number of coefficients of the $G\_N$, i.e., about $\sum\_{N \le D} N^9 \approx D^{10}$ operations, so the expected cost is

$$
\underbrace{O(D^{10})}_{\text{cost of one test}} \times \underbrace{\frac{8p}{D^4}}_{\text{expected number of walks (at most)}} \approx\, p \cdot D^6.
$$

This is *worse* than Costello–Smith: the cost of each test grows much faster than the density.

## Step 3: batch testing

The algorithm above is therefore not good enough, but we can do much better with batching. The key observation is that we don't need to know immediately whether an endpoint is split. This idea is inspired by the new attacks that came out in dimension 1 [^Udo26]: instead of testing each endpoint as soon as we reach it, we collect many endpoints and evaluate $g$ at all of them at once, to amortise the cost of one evaluation. For this, we use the *multivariate multipoint evaluation* (MME) algorithm of Kedlaya and Umans [^KU11]: 

> **Theorem.** For any fixed $\delta > 0$, a polynomial in three variables over $\mathbb{F}\_q$ of degree less than $d$ in each variable can be evaluated at $M$ points in time $(d^3 + M)^{1+\delta}(\log q)^{1+o(1)}$. 

After dehomogenising (on the chart $I\_{10} = 1$), $g$ is a polynomial in three variables of degree $O(D^4)$ in each variable, so it can be evaluated at $M$ points in time $(D^{12} + M)^{1+\delta}\,p^{o(1)}$, for any fixed $\delta > 0$. Taking batches of size $M \approx D^{12}$, the cost per endpoint becomes only $p^{o(1)}$ (as $\delta$ can be taken arbitrarily small; this is what the $p^{o(1)}$ means here and below), and the expected cost becomes

$$
\underbrace{p^{o(1)}}_{\text{cost of one test (in batches)}} \times \underbrace{\frac{8p}{D^4}}_{\text{expected number of walks (at most)}} + \underbrace{D^{12}}_{\text{at least one batch}} = \left(\frac{p}{D^4} + D^{12}\right) p^{o(1)}.
$$

This gives us our final algorithm: take many walks, and batch test whether their endpoints lie in the union of $\mathcal{H}\_1$ and the $\mathcal{H}\_{N^2}$ for $2 \leq N \leq D$. If not, repeat.

<img src="../../../images/posts/dim2-attack/batch-walks.png">

Once we find an endpoint $J^\prime$ that is $(N,N)$-split, we compute the splitting $J^\prime \rightarrow E\_1 \times E\_2$ itself (a one-off computation), and we are done with the bottleneck step. This gives the main theorem of the paper.

## The main theorem

> **Theorem.** Let $2 \le D \le p^{1/16}$. There is an algorithm for the superspecial isogeny problem in dimension 2 consisting of:
>
> 1. a *precomputation*, depending only on $p$ and $D$, which runs in expected time $D^{19}\,p^{o(1)}$ and memory $D^{12}\,p^{o(1)}$, and succeeds with overwhelming probability;
> 2. an *online phase* which, given $A\_1$ and $A\_2$, always returns an isogeny $A\_1 \rightarrow A\_2$ and, if the precomputation succeeded, runs in expected time $(p/D^4 + D^{12})\,p^{o(1)}$ and memory $(D^{12} + p^{1/2})\,p^{o(1)}$.

This result is unconditional. The optimal choice of $D$ depends on the application.

**Many instances (without the precomputation).** If the precomputation has already been done for a fixed $p$, we only need to balance the walks against the batch evaluation: $p/D^4 = D^{12}$ gives $D = p^{1/16}$, and the algorithm runs in time and memory $p^{3/4+o(1)}$ per instance (after a one-off precomputation in time $p^{19/16+o(1)}$).

**A single instance (with the precomputation).** If we also count the cost of the precomputation, we need to balance it against the walks instead: $D^{19} = p/D^4$ gives $D = p^{1/23}$, and the algorithm runs in time $p^{19/23+o(1)} \approx p^{0.826}$ and memory $p^{12/23+o(1)}$.

**Limited memory.** If we restrict to memory $p^{1/2+o(1)}$, as in the rigorous Costello–Smith algorithm, we can take $D = p^{1/24}$, which gives time $p^{5/6+o(1)}$. The paper gives finer time–memory trade-offs.

# Conclusion

In dimension 2, splittings are the key: they have no analogue in dimension 1. Humbert surfaces allow us to detect them, and the algorithms we have seen in this post differ in how far into the graph they let us look:

| Algorithm | Time | Memory | Assumptions |
|---|---|---|---|
| Costello–Smith | $\tilde{O}(p)$ | – | Ramanujan heuristic |
| SplitSearcher | $p^{1+o(1)}$ (concretely faster) | – | Ramanujan heuristic |
| Rigorous Costello–Smith | $p^{1+o(1)}$ | $p^{1/2+o(1)}$ | none |
| Houben–Pham | $p^{4/5+o(1)}$ | $p^{4/5+o(1)}$ | two heuristics + GRH |
| New: single instance | $p^{19/23+o(1)}$ | $p^{12/23+o(1)}$ | none |
| New: per instance | $p^{3/4+o(1)}$ | $p^{3/4+o(1)}$ | none |

When I was working on SplitSearcher, I believed that taking $N$ large would not be beneficial. And, in fact, this belief was well-founded: as we discussed above, you do not gain anything by *just* taking large $N$. The magic here comes from pairing this idea with batch testing, for which multivariate multipoint evaluation (MME) is key. The cost of the MME algorithms that we used above is a purely asymptotic statement; their concrete performance is still very much to be determined. 

There is also room for improvement on the theoretical side. Without the precomputation, the cost of a single instance is $p^{3/4 + o(1)}$, and going below this seems to require a new idea. Both the density of the surfaces detected by $g$ and the size of $g$ are governed by the same quantity: the total weight $W \approx D^4$ of $g$. Indeed, $g$ vanishes on about a $W/p$ proportion of superspecial surfaces, and has about $W^3$ coefficients. Balancing the $p/W$ walks against the $W^3$ cost of each batch gives $W = p^{1/4}$, and a cost of $p^{3/4}$ independently of the values of $N$ we use to build $g$. This suggests that $p^{3/4}$ is the limit of testing membership with a single polynomial in three variables using multipoint evaluation.


If you want to read more, the four papers behind this story are: Costello–Smith ([ePrint 2019/1387](https://eprint.iacr.org/2019/1387)), SplitSearcher ([ePrint 2022/1736](https://eprint.iacr.org/2022/1736)), rapid mixing and the rigorous Costello–Smith algorithm ([ePrint 2026/2429](https://eprint.iacr.org/2026/2429)), and the new algorithm ([ePrint 2026/2808](https://eprint.iacr.org/2026/2808)).

# References

[^HP26]: M. Houben and L. L. Pham. Computing endomorphisms of superspecial principally polarized abelian surfaces in time and memory $p^{4/5+o(1)}$. [ePrint 2026/2530](https://eprint.iacr.org/2026/2530).

[^Piz90]: A. K. Pizer. Ramanujan graphs and Hecke operators. *Bulletin of the American Mathematical Society*, 23(1):127–137, 1990.

[^Wes26]: B. Wesolowski. The supersingular isogeny problem in time and memory $p^{1/3+o(1)}$. [ePrint 2026/1486](https://eprint.iacr.org/2026/1486).

[^DG16]: C. Delfs and S. D. Galbraith. Computing isogenies between supersingular elliptic curves over $\mathbb{F}\_p$. *Designs, Codes and Cryptography*, 78(2):425–440, 2016.

[^IK94]: T. Ibukiyama and T. Katsura. On the field of definition of superspecial polarized abelian varieties and type numbers. *Compositio Mathematica*, 91(1):37–46, 1994.

[^CS20]: C. Costello and B. Smith. The supersingular isogeny problem in genus 2 and beyond. In *PQCrypto 2020*, pages 151–168. Springer, 2020.

[^JZ26]: B. W. Jordan and Y. Zaytman. Isogeny graphs of superspecial abelian varieties and Brandt matrices. *Journal of the Mathematical Society of Japan*, 2026.

[^ATY24]: Y. Aikawa, R. Tanaka, and T. Yamauchi. Isogeny graphs on superspecial abelian varieties: eigenvalues and connection to Bruhat–Tits buildings. *Canadian Journal of Mathematics*, 76(6):1891–1916, 2024.

[^RM]: M. Corte-Real Santos, H. Kır, O. Taïbi, and B. Wesolowski. Rapid mixing in superspecial isogeny graphs. [ePrint 2026/2429](https://eprint.iacr.org/2026/2429).

[^dim1]: You might wonder why we don't use the faster dimension 1 algorithm mentioned above. As Step 2 is not the bottleneck, there is no need to. Instead, we use the algorithm of Page and Wesolowski ([ePrint 2023/1399](https://eprint.iacr.org/2023/1399), Alg. 7), which runs in time $\tilde{O}(\sqrt{p})$, is unconditional, and allows us to construct isogenies $E\_1 \rightarrow E\_3$ and $E\_2 \rightarrow E\_4$ whose degrees are powers of 2 with even exponent. Composing the one of smaller degree with multiplication by a suitable power of 2 makes the two degrees equal, so that they combine into a polarised isogeny $E\_1 \times E\_2 \rightarrow E\_3 \times E\_4$. This step costs $\tilde{O}(\sqrt{p})$ time and $p^{1/2+o(1)}$ memory, which is negligible compared to finding the splittings.

[^CCF22]: M. Corte-Real Santos, C. Costello, and S. Frengley. An algorithm for efficient detection of $(N,N)$-splittings and its application to the isogeny problem in dimension 2. [ePrint 2022/1736](https://eprint.iacr.org/2022/1736).

[^Hum99]: G. Humbert. Sur les fonctions abéliennes singulières. I, II, III. *J. Math. Pures Appl.* (5), 5:233–350 (1899), 6:279–386 (1900), 7:97–123 (1901).

[^Kan94]: E. Kani. Elliptic curves on abelian surfaces. *Manuscripta Mathematica*, 84:199–223, 1994.

[^Kum15]: A. Kumar. Hilbert modular surfaces for square discriminants and elliptic subfields of genus 2 function fields. *Research in the Mathematical Sciences*, 2(1), 2015.

[^Fre24]: S. Frengley. On the geometry of the Humbert surface of square discriminant. [arXiv:2408.09830](https://arxiv.org/abs/2408.09830).

[^FK91]: G. Frey and E. Kani. Curves of genus 2 covering elliptic curves and an arithmetical application. In *Arithmetic Algebraic Geometry*, pages 153–176. Springer, 1991.

[^Udo26]: A. Udovenko. Solving the supersingular isogeny problem in time $p^{2/5+o(1)}$ using bivariate multipoint evaluation. [ePrint 2026/1575](https://eprint.iacr.org/2026/1575).

[^KU11]: K. S. Kedlaya and C. Umans. Fast polynomial factorization and modular composition. *SIAM Journal on Computing*, 40(6):1767–1802, 2011.
