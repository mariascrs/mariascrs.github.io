---
layout: article
title: Cryptographic Smooth Neighbors
tags: maths isogeny sqisign cryptography post-quantum paper
mathjax: true
aside:
  toc: true
---

This blogpost aims to give a general overview of our new paper *"Cryptographic Smooth Neighbors"* ([link](https://eprint.iacr.org/2022/1439)). This is joint work with Giacomo Bruno, Craig Costello, Jonathan Komada Eriksen, Michael Naehrig, Michael Meyer, and Bruno Sterner.

## $B$-Smooth Neighbours

In this paper, we revisit the problem of finding two consecutive $B$-smooth integers, i.e., find integers $(r, r+1)$ such that $r$, $r+1$ have no prime factors of size exceeding the smoothness bound $B$.  
This problem that has emerged in the context of instantiating efficient isogeny-based public key cryptosystems. 
Though initially motivated in the context of key exchange[^1], it has found applications in the search for parameters for SQISign[^2], the leading isogeny-based signature scheme. For these cryptographic applications we work over the finite field $\mathbb{F}\_{p^2}$ for some prime $p$, where we require $p^2-1$ to be as smooth as possible. This is because $p^2-1$ often corresponds to the rational torsion available that will be used for isogeny computations. Roughly speaking, the smaller the smoothness bound, the faster the signature scheme will be. 
If we have a pair of twin $B$-smooth integers $(r, r+1)$ and let $p = 2r+1$, then $p^2-1 = 4r(r+1)$ is $B$-smooth, as required.

Whilst SQISign is currently the most compact post-quantum signature scheme, its signing algorithm is orders of magnitude slower than its counterparts. Therefore, it is desirable to find primes $p$ with $p^2-1$ smooth as possible to increase SQISign's efficiency, which would be highly beneficial for its practicality. 

In this work, we introduce new ways of finding large twin smooths based on the Conrey-Holmstrom-McLaughlin (CHM) algorithm. It is a constructive algorithm which finds *almost* all twin smooth integers for a smoothness bound $B$. In their paper, Conrey--Holmstrom--McLaughlin run this algorithm for $B = 200$ to find a list of 346,192 twin smooths in about 2 weeks, the largest of which were 79-bit integers. We first give an optimised implementation of the CHM algorithm that allows us to run it for much larger values of $B$, thus allowing us to find larger sized twins. For example, with $B = 547$, our implementation outputs a set of 82,026,426 pairs of $B$-smooth twins, the largest of which were 122-bit integers. However, it appears infeasible to increase $B$ to the point where the twins found purely using the CHM algorithm
are large enough to be used for cryptographic applications. Aided by the fact that SQISign does not require $p^2-1$ to be *fully* smooth, we obtain cryptographic sized primes $p$ by combining larger twins found through CHM with techniques from the literature.

## The CHM Algorithm

The CHM algorithm is a simple algorithm that generates B-smooth neighbours. It works as follows:

* We start with an initial set $S^{(0)} = ${$1, 2, ..., B-1$} of positive integers less than $B$, representing twin smooth pairs $(1,2), (2,3), ..., (B-1, B)$.
* Set $S^{(1)} =S^{(0)}$.
* Iteratively pass through all pairs of distinct $r < s$ in $S^{(0)}$ and compute 
      $\frac{t}{t'} = \frac{r}{r+1}\cdot \frac{s+1}{s},$
with $\frac{t}{t'}$ in lowest terms. If $t' = t+1$, then $t$ represnts a $B$-smooth pair $(t, t+1)$ and we add it to the set $S^{(1)}$. 
* The algorithm then iterates through all pairs of distinct $r,s$ in $S^{(1)}$ to form $S^{(2)}$, and so on. 
* We terminate when $S^{(d)} = S^{(d+1)}$ for some $d \geq 0$. 

#### Example: $B$ = 5

* We start with the set $S^{(0)} = ${$1,2,3,4$}. 
* Going through distinct $(r,s)$ in $S^{(0)}$, the only pairs that give us a new twin smooth pair $(t, t+1)$ are $(2,3)$, $(2,4)$ and $(3,4)$: 
      $ \frac{2}{2+1}\cdot \frac{3+1}{3} = \frac{8}{9},  \quad \frac{2}{2+1}\cdot \frac{4+1}{4} = \frac{5}{6}, \quad \frac{3}{3+1}\cdot \frac{4+1}{4} = \frac{15}{16}$. So we get $S^{(0)} = ${$1,2,3,4,5,8,15$}.
* Continuing in this way we get $S^{(2)} = ${$1,2,3,4,5,8,9,15,24$}, and $S^{(3)} = ${$1,2,3,4,5,8,9,15,24, 80$}.
* Then $S^{(4)} = S^{(3)}$, so we terminate and return $S^{(3)}$. 

This is indeed the full set of twin 5-smooth integers[^3].

## Implementing the CHM algorithm

To determine how feasible it is to run the CHM algorithm to obtain twin smooths of cryptographic size, we implement an optimised CHM algorithm. Some optimisations include: 

* Parallelisation
* Avoiding multiple checks of the same pairs of twin smooths $(r,s)$ 
* Iterating through smoothness bounds
* For each pair $(r,s)$ considered in each CHM step, we need to check if for some $t$, the following holds:
$\frac{t}{t+1} = \frac{r}{r+1}\cdot \frac{s+1}{s}.$ In the paper we show that this is equivalent to requiring $\gcd(r(s+1),(r+1)s) = s-r$. We observe that we can completely avoid the gcd calculation: instead, we check that $r(s+1) \equiv 0 \bmod (s-r)$ holds, and perform a division to compute $t$ if so. In this way, we do just one modular reduction per pair $(r,s)$ considered in each CHM step.


Despite these optimisations, using the pure CHM algorithm to produce large enough twin smooths for cryptographic purposes is infeasible in practice due to both runtime and memory limitations. Indeed, we ran this approach up to smoothness bound $B=547$ and found that to reach a twin smooth pair of size at least 256 bits requires smoothness bound of $> 5000$ for which the set of $B$-smooth twins is roughly $2^{49}$. Noting that the effort for CHM iterations grows quadratically with the set size, we deduce that it is not feasible to reach cryptographically sized smooth twins. 

Therefore, we looked for variants of the CHM algorithm that restrict to checking only a certain subset of $(r,s)$ pairs without losing too many of the new smooth neighbors. 
Observing that similar sized $(r,s)$ are more likely to produce new twim smooths, we use the following condition to restrict the visited pairs: Let $k>1$ be a constant parameter. Then, we only check pairs $(r,s)$ if they satisfy $0 < r < s < kr$.

Compared to the full CHM algorithm, this leads to a smaller set of twin smooths, but allows for much faster running times.
The two main flavours of this that we explore are:

* **Global-$k$**: we initially pick some $k$ with $1 < k \leq 2$, and restrict the CHM algorithm to only check $k$-balanced pairs $(r,s)$. The choice of $k$ is subtle: choosing $k$ too close to 1 may lead to missing too many twin smooths, but picking $k$ close to 2 may result in a small speedup that does not allow us to run large smoothness bounds. 
* **Constant-Range**: In the above method, checking if a pair is $k$-balanced consumes a significant part of the overall runtime. Therefore, we can use constant ranges to avoid these checks. Sorting the set $S$ of twins by size, we can instead fix a range $R$ and for each $r$ we check the pair $(r,s)$ for the $R$ successors $s$ of $r$ in $S$.  

The *constant-range* approach outperforms the *global-$k$* approach in terms of runtime, due to the elimination of all checks for $k$-balance of twins. Additionally, while very aggressive instantiations of *constant-range* miss more twin smooths, they find a bigger share of the largest 100 twins compared to their *global-$k$* counterpart.
We therefore concluded that for larger smoothness bounds $B$, for which we cannot hope to complete the full CHM algorithm, *constant-range* is the most promising approach for obtaining larger twin smooths within feasible runtimes.


|     **Variant**    | **Parameter** | **Runtime** | **Speedup** | **# twins** | **# twins from largest 100** |
|:------------------:|:-------------:|:-----------:|:-----------:|:-----------:|:----------------------------:|
|    **Full CHM**    |       -       |    4705s    |      1      |   2300724   |              100             |
|   **Global-$k$**   |   $k = 1.5$   |     226s    |      21     |   2282741   |              82              |
| **Constant-Range** |  $R = 10000$  |     82s     |      57     |   2273197   |              93              |




## Finding cryptographic smooth neighbours

We now focus on finding primes $p$ suitable for isogeny-based cryptographic applications that, for efficiency reasons, need $p^2-1$ to be as smooth as possible. In particular, we target the signature scheme SQISign[^2], which requires a prime $p$ satisfying $T' \mid p^2-1$, where $T' = 2^fT$ with $f$ is as large as possible and $T \approx p^{5/4}$ is smooth and odd. We note that these conditions mean we do not require $(p+1)(p-1)$ to be fully smooth, which allows for some flexibility. Therefore, we can move away from solely using CHM and, instead, use the CHM results as inputs to known method for finding such primes.

We find fully smooth twins of a smaller bit-size via CHM and boost them up using the polynomials $p_n(x) = 2x^n - 1$ (for carefully chosen $n$). 

**General Method.** For our SQISign application, we have $\log p = ${$256, 384, 512$} for NIST Level I, III, V (respectively), $T \approx p^{5/4}$ and $f$ as large as possible. We will aim for $T' \approx p^{3/2}$ as this is what is currently used in the SQISign implementation. 
We fix a smoothness bound $B$ and let $p_n(x) = 2x^n - 1$. Then, $p_n(x)^2-1 = 4x^n(x-1)f_n(x)$. If we evaluate $p_n(x)$ at $x = r$, where $(r, r-1)$ is a $B$-smooth twin pair, then $p_n(r)^2-1$ will have guaranteed smooth factor $4r^n(r-1)$. We then have to hope that the factor $f_n(r)$ has enough smoothness so that $T' \approx p^{3/2}$.

A natural question arises: what $n$ should we choose?
* To obtain a prime of bitsize $\log(p)$ we need to evaluate $p_n(x)$ at $B$-smooth twins of bitsize $(\log(p) - 1)/n$. 
* For small $n$, we require CHM to find twin smooths of *large* bit size. For certain bit sizes, running
full CHM may be computationally out of reach, and therefore we use a variant that may not find all twins. In this case, however, we have more guaranteed smoothness in $p^2 - 1$ and so it is more likely that the remaining factors will have the required smoothness. 
* For large $n$, we can obtain more twin smooths from CHM (in some cases, we can even exhaustively search for all twin
smooths), however we have less guaranteed smoothness in $p^2-1$. 
* The more guaranteed smootheness we have from $4r^n(r-1)$, the more likely $f_n(r)$ has the required additional smoothness. Additionally, if $f_n(x)$ factors as $g_1(x)\cdots g_m(x)$, then the smaller the degrees $\deg (g_i)$ are, the higher the probability that we have enough smoothness.

Balancing the probability of guaranteed smoothness and being able to compute enough CHM twin smooths of the required bitsize, we make the following choices of $n$ for each NIST level:
* NIST-I parameters: $n = 2,3$
* NIST-III parameters: $n = 3,4,6$
* NIST-V parameters: $n = 4,6$


We notice that for $n$ even, both $x - 1$ and $x+1$ appear in the factorisation of $p_n(x)^2-1$, and so we consider twin smooths $(r, r \pm 1)$ to give a guaranteed smooth factor $4r^n(r\pm 1)$ in $p_n(r)^2-1$. As a result, for $n$ even, we have a larger pool of twin smooths to try. 

**Alternative Methods.** In the paper we also discuss alternative methods to construct twin smooths, which we then boost up using our $p_n(x)$ method. These methods include the XGCD approach (see e.g.[^2]) and the PTE approach[^4]. 

## Results

After running our *constant-range* variant of the CHM algorithm to obtain sufficient twin smooths of different bitsizes and smoothness $B$, we used the method described above to obtain SQISign parameters.  I'll briefly list the *best* primes (in terms of the signing cost metric $\sqrt{B}/f$, which we want to be as small as possible) that we found for each NIST security level. Recall that for SQISign we only require a factor $T' \approx p^{3/2}$ of $p^2-1$ to be smooth, i.e., there may be some factors dividing $p^2-1$ that are not $B$-smooth. These *rough* factors will be displayed in **bold**.

To see more primes for each NIST level, make sure to check out the full paper.

**NIST-I Parameters:** The 254-bit prime $p = 2r^3-1$ with $r = 20461449125500374748856320$ has 
    $$\begin{align*}
    p+1 &= 2^{46}\cdot 5^3 \cdot 13^3 \cdot 31^3 \cdot 73^3 \cdot 83^3 \cdot 103^3 \cdot 107^3 \cdot 137^3\cdot 239^3 \cdot 271^3 \cdot 523^3 \\
    p - 1 &= 2 \cdot 3^3 \cdot 7\cdot 11^2\cdot 17^2\cdot 19\cdot 101\cdot 127\cdot 149\cdot 157\cdot 167\cdot 173\cdot 199\cdot 229 \\
    &\quad \quad  \cdot 337\cdot 457\cdot 479\cdot \mathbf{141067}\cdot \mathbf{3428098456843}\cdot \mathbf{4840475945318614791658621}
    \end{align*}$$

In comparison, the state-of-the-art implementation of SQISign uses a 254-bit prime $p$ with $p^2-1$ being $3923$-smooth[^5]. However, their prime has a larger power of 2 and 3 compared to our prime, and most of the smooth factors are relatively small. Therefore, despite the larger smoothness bound, it may perform better in practice. Evaluating this in detail would require an implementation of our primes into the SQISign code. However, the current implementation uses specific optimisations that only apply to the particular prime that is being used, and so changing the prime would require reshaping the specific optimisations in the setting of our primes. We therefore leave this for future work.

One of the main contributions of our work is finding the first credible primes for SQISign at the NIST-III and NIST-V security level. In fact, most of the primes $p$ we found have the majority of the smooth factors of $p^2-1$ being relatively small, and therefore lend themselves well to efficient implementations.

**NIST-III Parameters:** The $382$-bit prime $p = 2r^6 - 1$ with $r = 11896643388662145024$ has
    $$\begin{align*}
    p+1 &= 2^{79}\cdot 3^6 \cdot 23^{12} \cdot 107^6 \cdot 127^6 \cdot 307^6 \cdot 401^6 \cdot 547^6 \\
    p - 1 &= 2 \cdot 5^2 \cdot 7\cdot 11\cdot 17\cdot 19\cdot 47\cdot 71\cdot 79\cdot 109\cdot 149\cdot 229\cdot 269\cdot 283\cdot 349\cdot 449 \\
    &\quad \quad  \cdot 463\cdot 1019\cdot 1033\cdot 1657\cdot 2179\cdot 2293\cdot 4099\cdot 5119\cdot 10243 \cdot\mathbf{381343} \\
    & \quad \quad  \cdot \mathbf{19115518067}\cdot \mathbf{740881808972441233} \cdot \mathbf{8323214379148213516392}
    \end{align*}$$

**NIST-V Parameters:** The $510$-bit prime, $p = 2r^6 - 1$ where $r = 31929740427944870006521856$ has 

$$\begin{align*}
    p+1 &= 2^{85}\cdot 17^{12} \cdot 37^{6} \cdot 59^6 \cdot 97^6 \cdot 233^6 \cdot 311^{12} \cdot 911^6 \cdot 1297^6 \\
    p - 1 &= 2 \cdot 3^2 \cdot 5\cdot 7\cdot 11^2 \cdot 23^2 \cdot 29\cdot 127\cdot 163\cdot 173\cdot 191\cdot 193\cdot 211\cdot 277\cdot 347\cdot 617 \\
    &\quad \quad  \cdot 661\cdot 761\cdot 1039\cdot 4637\cdot 5821\cdot 15649\cdot 19139\cdot 143443\cdot 150151 \cdot\mathbf{3813769} \\
    & \quad \quad  \cdot \mathbf{358244059}\cdot \mathbf{992456937347} \cdot \mathbf{353240481781965369823897507} \\
    & \quad \quad  \cdot \mathbf{860102006951457440137165889140302}  
    \end{align*}$$

# References

[^1]: Costello, C., 2020, December. B-SIDH: supersingular isogeny Diffie-Hellman using twisted torsion. In International Conference on the Theory and Application of Cryptology and Information Security (pp. 440-463). Springer, Cham.
[^2]: De Feo, L., Kohel, D., Leroux, A., Petit, C. and Wesolowski, B., 2020, December. SQISign: compact post-quantum signatures from quaternions and isogenies. In International Conference on the Theory and Application of Cryptology and Information Security (pp. 64-93). Springer, Cham.
[^3]: Størmer, C., 1897. Quelques théorèmes sur l’équation de Pell $x^2− Dy^2=\pm 1$ et leurs applications. Skrift. Vidensk. Christiania I. Math.-naturv. Klasse, (2), p.48.
[^4]: Costello, C., Meyer, M. and Naehrig, M., 2021, October. Sieving for twin smooth integers with solutions to the Prouhet-Tarry-Escott problem. In Annual International Conference on the Theory and Applications of Cryptographic Techniques (pp. 272-301). Springer, Cham.
[^5]: De Feo, L., Leroux, A. and Wesolowski, B., 2022. New algorithms for the Deuring correspondence: SQISign twice as fast. Cryptology ePrint Archive.
