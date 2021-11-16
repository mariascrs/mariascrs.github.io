---
layout: article
title: SuperSolver - accelerating the Delfs-Galbraith algorithm with fast subfield root detection
tags: maths isogeny cryptography post-quantum paper
mathjax: true
aside:
  toc: true
---

This blogpost aims to give a general overview of our new paper *"SuperSolver: accelerating the Delfs-Galbraith algorithm with fast subfield root detection"* ([link](https://eprint.iacr.org/2021/1488)). This is joint work with my amazing coauthors Craig Costello and Jia Shi.

## The supersingular isogeny problem and the Delfs-Galbraith algorithm

The *supersingular isogeny problem* asks the following: given two supersingular curves $E_0/\bar{\mathbb{F}}\_p$ and $E_1/\bar{\mathbb{F}}\_p$, find an isogeny 

$$
\phi: E_0 \rightarrow E_1.
$$

The best known classical attack against it is the Delfs-Galbraith algorithm [^1]. In the general case, where $E_0, E_1$ are defined over $\mathbb{F}\_{p^2}$, the Delfs-Galbraith algorithm has 2 steps:

* **Step 1:** Compute simple self-avoiding random walks in the $\ell$-isogeny graph (for some choice of $\ell$) to find isogenies $\phi_0: E_0 \rightarrow E_0'$ and $\phi_1: E_1 \rightarrow E_1'$, such that $E_0'/\mathbb{F}\_p$ and $E_1'/\mathbb{F}\_p$ are *subfield curves*. You may be asking, what exactly is a subfield curve? In general the $j$-invariant of an elliptic curve $E$ lies in $\mathbb{F}\_{p^2}$. If $j \in \mathbb{F}\_p$, we say $E$ is a subfield curve. There are approximately $\lfloor p/12 \rfloor$ supersingular curves up to isomorphism and $O(p^{1/2})$ of them are subfield curves. This step, therefore, runs in $\tilde{O}(p^{1/2})$ bit operations. 

* **Step 2:** Search for a subfield isogeny $\phi': E_0' \rightarrow E_1'$ that connects $\phi_0$ and $\phi_1$. This step requires $\tilde{O}(p^{1/4})$ bit operations. 

A full isogeny $\phi: E_0 \rightarrow E_1$ is then found as the composition 
$$
\phi = \hat{\phi}_1 \circ \phi' \circ \phi_0
$$
where $\hat{\phi}_1: E_1' \rightarrow E_1$ is the dual of $\phi_1$. 

The entire Delfs-Galbraith algorithm runs in $\tilde{O}(p^{1/2})$ operations on average, dominated by the first step. 

## Determining the Concrete Complexity of Delfs-Galbraith

One of our contributions is an optimised implementation of the Delfs-Galbraith algorithm, called **Solver**. This allows us to remove the $\tilde{O}$'s above and determine the concrete complexity of this algorithm. 

In the paper, we focus on the optimisation and complexity of the bottleneck step: finding subfield curves (step 1 above). These optimisations are as follows.

**Choice of $\ell$**. In their description of the algorithm, Delfs and Galbraith do not specify which $\ell$-isogeny graph to walk in. In general, at each point of this walk in the $\ell$-isogeny graph, we have $j_p$ (the previous node we were on) and $j_c$ (the current node we're on). Taking a step from $j_c$ onto a new node in the $\ell$-isogeny graph is equivalent to computing the roots of the polynomial $\Phi_{\ell,p}(X,j_c)/(X-j_p)$, where $\Phi_{\ell, p}(X,Y)$ is the modular polynomial for level $\ell$ whose coefficients have been reduced modulo $p$, as we are working over $\mathbb{F}\_{p^2}$ (click [here](https://math.mit.edu/~drew/ClassicalModPolys.html) for more information on these modular polynomials). Writing $\ell$ in terms of its prime decompostion, say $\ell= \prod_{i=1}^n l_i^{e_i}$, the polynomial $\Phi_{\ell, p}(X,j_c)/(X-j_p)$ is of degree $N_\ell - 1$, where
$$
N_\ell = \prod_{i=1}^n (l_i + 1)l_i^{e_i -1 }.
$$
If $\ell$ is prime, then the polynomial $\Phi_{\ell, p}(X,j_c)/(X-j_p)$ is of degree $\ell$. We chose $\ell = 2$, as it is the simplest and most efficient choice. 
Note here that the first step is an exception as we do not know $j_p$, so we must instead factor an $N_\ell$-degree polynomial to find a neighbouring node. 



**Fast square root finding in $\mathbb{F}\_{p^2}$**. We use techniques presented in Michael Scott's *Tricks of the Trade* paper [^2] to construct an optimised algorithm for finding square roots in $\mathbb{F}\_{p^2}$. Our algorithm requires only two $\mathbb{F}\_p$ exponentiations and a few $\mathbb{F}\_p$ multiplications and additions. 

**Random walks in the $2$-isogeny graph**. We use a depth-first search to find subfield nodes in the 2-isogeny graph. For more detials on this, see Section 3 of the paper. 

### Concrete Complexity of Delfs-Galbraith

Using **Solver**, for each bitlength between 21 and 40, we solved 10,000 instances of the subfield search. In each of these, we chose 100 random primes and, for each prime, 100 pseudo-random $j$-invariants in $\mathbb{F}\_{p^2}$. 

For all bitlengths, we find the number of $\mathbb{F}\_{p}$ multiplications to be:
$$
\#(\mathbb{F}\_{p} \text{ muls.}) = c \cdot \sqrt{p} \cdot \log_2 p
$$
with $0.75 \leq c \leq 1.05$.


## SuperSolver: accelerating the Delfs-Galbraith algorithm

The other contribution of our paper is an new attack, called **SuperSolver**, against the supersingular isogeny problem that vastly improves on the concrete complexity of the Delfs-Galbraith algorithm. The core difference of **SuperSolver** lies in Step 1: at each step of the random walk, **SuperSolver** inspects the $\ell$-isogeny graph for $\ell$ in a carefully chosen set of *optimal* $\ell > 2$, to efficiently detect whether $j_c$ has an $\ell$-isogenous neighbour in $\mathbb{F}\_p$, where $j_c$ is the current node. Traditionally, conducting this inspection requires fully factorizing a degree-$(N_\ell-1)$ polynomial and determining whether any of the roots lie in $\mathbb{F}\_{p}$. However, this is prohibitively costly for $\ell > 2$, especially as $p$ grows large. In the paper, we introduce a novel method of conducting this inspection in $\ell$-isogeny graphs, which requires $O(\ell^2)$ multiplications in $\mathbb{F}\_p$. Crucially, this is no longer dependent on $p$, meaning that as $p$ grows large, the set of $\ell$'s that are optimal to use also grows, and the more profitable (relatively speaking) **SuperSolver** becomes. 

We now describe 

* how the rapid inspection of $\ell$-isogenous neighbours is conducted, and
* how the set of $\ell$'s to conduct this inspection on is chosen.

### Fast Subfield Root Detection

In Section 4 of the paper, we derive a method for determining whether a polynomial $f(X) = a_nX^n + \dots + a_1X + a_0 \in \mathbb{F}\_{q^d}[X]$ has a root in the subfield $\mathbb{F}\_q$, where $q$ is the power of a prime $p$. Here, for simplicity, I will describe it as needed for **SuperSolver**, i.e., where $q = p$ and $d=2$. 


We first introduce the $p$-power Frobenius map $\pi$, which for $\alpha \in \mathbb{F}\_{p^2}$ acts as
$$
\pi(\alpha) = \alpha^{p}.
$$
We can extend this to polynomials as follows: if $f(X) = a_nX^n + \dots + a_1X + a_0 \in \mathbb{F}\_{p^2}[X]$, then 
$$
\pi(f) = \pi(a_n)X^n + \dots + \pi(a_1)X + \pi(a_0).
$$
Writing $f$ as 
$$
f = \prod_{i=1}^{n} (X - \alpha_i)
$$
where $\alpha_i$ are the roots of $f$ (not necessarily distinct), we have
$$
\pi(f) = \prod_{i=1}^{n} (X - \pi(\alpha_i)).
$$
From this we can see that a polynomial $f \in \mathbb{F}\_{p^2}[X]$ will have a root in $\mathbb{F}\_p$ if and only if $f$ and $\pi(f)$ have a common root, i.e., their greatest common divisor is non-constant. Indeed, $f$ and $\pi(f)$ have a common root, say $\alpha$, if and only if $\alpha = \pi(\alpha)$. This is equivalent to $\alpha \in \mathbb{F}\_p$.

The problem is that $f$ and $\pi(f)$ are, in general, defined over $\mathbb{F}\_{p^2}$. To avoid costly multiplications in $\mathbb{F}\_{p^2}$, we want to, in some way, transform these into polynomials defined over $\mathbb{F}\_p$.

A key observation is that the GCD of two polynomials is invariant under an invertible linear transformation. Consider $f_1,f_2 \in \mathbb{F}\_{p^2}[X]$ and define
$$
g_1 = af_1 + bf_2, \ \ g_2 = cf_1 + df_2
$$
such that $ad-bc \neq 0$, i.e., $g_1, g_2$ are given by applying an invertible linear transformation to $f_1, f_2$. Then if $h \in  \mathbb{F}\_{p^2}[X]$ divides $f_1$ and $f_2$, it must divide $g_1, g_2$. As the linear transformation is invertible, by swapping the roles of $f_i$ and $g_i$ we show that if $h \in  \mathbb{F}\_{p^2}[X]$ divides $g_1, g_2$, it must divide $f_1, f_2$. Therefore,
$$
\gcd(f_1, f_2) = \gcd(g_1, g_2).
$$

This means that if we can find some invertible linear transformation that sends $f, \pi(f)$ to related polynomials, say $g_1, g_2$ defined over $\mathbb{F}\_p$, then we will have  
$$
\gcd(f, \pi(f)) = \gcd(g_1, g_2).
$$
This means that we can determine whether $f \in \mathbb{F}\_{p^2}[X]$ has a root in $\mathbb{F}\_p$ by simply computing a $\gcd$ in $\mathbb{F}\_p$.

To find this linear transformation, consider $\beta$ such that $\mathbb{F}\_{p^2} = \mathbb{F}\_{p}(\beta)$ (i.e. $\beta$ is a primitive element of the extension $\mathbb{F}\_{p^2}/\mathbb{F}\_p$), and define
$$
g_1 = f + \pi(f) \ \ \text{ and } \ \ g_2 = \beta(f - \pi(f)).
$$
Then, the linear transformation is invertible and $g_1, g_2 \in \mathbb{F}\_{p}[X]$. Note that the second statement is clear in the $d=2$ case, but for $d>2$ we need Theorem 2.24 in [^3] to easily show the resulting polynomials are defined over the base field. 

Concluding, we have
$$\gcd(f, \pi(f)) = \gcd(f + \pi(f), \beta(f - \pi(f))$$
and so $f\in \mathbb{F}\_{p^2}[X]$ has a root in $\mathbb{F}\_{p}$ if and only if $\gcd(f + \pi(f), \beta(f - \pi(f))$ is non-constant, where this $\gcd$ calculation can be done over $\mathbb{F}\_p$.


### Choosing the set of optimal $\ell$'s

Though the inspection of the neighbours of $j_c$ in the $\ell$-isogeny graph increases the total number of $\mathbb{F}\_p$ multiplications at each step, more nodes are checked. We therefore choose the list of $\ell$'s to minimise the number of $\mathbb{F}_p$ multiplications *per node inspected*. 

To do this, we first determine the cost per node inspected of taking a step in the $2$-isogeny graph, as described above. Call this $\text{cost}_2$. We then determine a list of $\ell > 2$ such that inspecting the $\ell$-isogeny graph (using the fast subfield root detection) has a lower cost per node inspected than $\text{cost}_2$. Once we have this list of $\ell$'s, we find the subset of this list which minimises the total cost of each step, calculated as:
$$
\text{cost} = \frac{\text{total \# of } \mathbb{F}\_p \text{ multiplications}}{\text{total \# of nodes revealed}}.
$$
This subset will be the list of *optimal $\ell$'s* used in **SuperSolver**. 

Calculating $\text{cost}_2$ depends only on the prime $p$, and the cost of inspecting the $\ell$-isogeny graph depends only on $\ell$. Therefore, this set of optimal $\ell$'s can be determined in the precomputation. 

We also note here that we can view **Solver** as a special instance of **SuperSolver** where the set of $\ell>2$ used is empty. In this way, we see that, in terms of the path length of Step 1, **SuperSolver** will never be outperformed by **Solver**: in **SuperSolver** either there exists an $\ell > 2$ that finds a subfield node first or the random walk in the $2$-isogeny graph finds the subfield node at the same step it would have been found in **Solver**.

To see exactly how **SuperSolver** works in comparison to **Solver**, have a look at the worked example in Section 6 of the paper. 

## Solver vs. SuperSolver

I'll now summarise the results of our experiments in Section 7 of the paper. These experiments focused solely on the search for subfield nodes in Step 1 and showed the following:

* By conducting experiments on small primes and many $j$-invaraints, we see that **SuperSolver** finds a subfield node with *much fewer* (on average, half) $\mathbb{F}\_{p}$ multiplications and by visiting less nodes. For example, averaging over 5000 pseudo-random supersingular $j$-invarants in $\mathbb{F}\_{p^2}$, for $p = 2^{24}-3$, **SuperSolver** (with the set of optimal $\ell$'s) used 53900 $\mathbb{F}\_{p}$ multiplications and walked on 318 nodes. In comparison, **Solver** used 112878 $\mathbb{F}\_{p}$ multiplications and walked on 1897 nodes.
* We also conducted experiments on large, cryptographic sized primes and one $j$-invariant, running **SuperSolver** and **Solver** until the number of $\mathbb{F}\_{p}$ multiplications used exceeded $10^8$. We recorded the total number of nodes covered, i.e., both walked *and* inspected nodes. In these experiments we see how the advantage of **SuperSolver** grows as $p$ grows. For $p=2^{50}-27$, **SuperSolver** covers between 3 and 4 times the number of nodes that **Solver** does. For the largest prime tested, $p=2^{800}-105$, **SuperSolver** covers between 18 and 19 times the number of nodes! 

## New Concrete Security

Our **Solver** and **SuperSolver** algorithms are written in Sage and Python and can be found [here](https://github.com/microsoft/SuperSolver).
By conducting experiments (as above) using our **SuperSolver** suite, it's straightforward to obtain precise estimates on the concrete classical security offered by the general supersingular isogeny problem. Indeed, from these experiments, we can obtain accurate counts on the expected number of $\mathbb{F}\_p$ multiplications, squarings
and additions that must be carried out during a full cryptanalytic attack. These $\mathbb{F}\_p$ operations can then be costed with respect to the appropriate metric, for example, bit operations, cycle counts, gate counts, or circuit depth.

## Bringing it all together

The Delfs-Galbraith algorithm can be used to attack and supersingular isogeny based cryptosystem, so what does this mean for isogeny-based cryptography? 

* There is no direct impact on SIDH and SIKE. There are much faster *claw-finding* algorithms [^4] for solving the special problems that arise in these schemes.
* This paper does influence the classical bit security of other proposals, such as B-SIDH [^5] and SQISign [^6] which have Delfs-Galbraith as their best attack.

We stress that the asymptotic complexity of this algorithm has not changed. However, we give *significant* improvements on its concrete complexity, helping us to better understand the security of the fundamental problem underlying isogeny-based cryptography. 


# References

[^1]: Delfs, C., & Galbraith, S. D. (2016). Computing isogenies between supersingular elliptic curves over ${\mathbb {F}}_p$. Designs, Codes and Cryptography, 78(2), 425-440.

[^2]: Scott, M. (2020). A note on the calculation of some functions in finite fields: Tricks of the Trade. IACR Cryptol. ePrint Arch., 2020, 1497.

[^3]: Lidl, R., & Niederreiter, H. (1997). Finite fields (No. 20). Cambridge University Press.

[^4]: Jao, D., & De Feo, L. (2011, November). Towards quantum-resistant cryptosystems from supersingular elliptic curve isogenies. In International Workshop on Post-Quantum Cryptography (pp. 19-34). Springer, Berlin, Heidelberg.

[^5]: Costello, C. (2020, December). B-SIDH: supersingular isogeny Diffie-Hellman using twisted torsion. In International Conference on the Theory and Application of Cryptology and Information Security (pp. 440-463). Springer, Cham.

[^6]: De Feo, L., Kohel, D., Leroux, A., Petit, C., & Wesolowski, B. (2020, December). SQISign: compact post-quantum signatures from quaternions and isogenies. In International Conference on the Theory and Application of Cryptology and Information Security (pp. 64-93). Springer, Cham.
